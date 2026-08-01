# zk-agent-mqtt.ps1 - Agente ZKAccess disparado por MQTT (on-demand), sin ventana.
# Se queda suscrito al broker; al recibir la orden hace UNA lectura+limpieza+subida
# a Guardian y publica el resultado. Pensado para correr como SERVICIO (NSSM) en
# PowerShell de 32 bits (por plcommpro.dll).
#
# Requisitos en C:\agente-zk :
#   - plcommpro.dll y dependencias (ya estan)
#   - M2Mqtt.Net.dll   (cliente MQTT; ver instrucciones de instalacion)
#   - token.txt        (X-Agent-Token de Guardian, fuera de git)
#   - mqtt-pass.txt     (password del broker, fuera de git)

# ---------------- Config ----------------
$sdk        = "C:\agente-zk"
$ip         = "192.168.1.151"
$siteId     = "INTERLOMAS"
$server     = "https://accesoswhatsapp.info/api/zk/lecturas"
$WindowSec  = 5
$BatchSize  = 500
$GuardSec   = 10
$cursorFile = "$sdk\zk-cursor-$($ip.Replace('.','_')).txt"

# MQTT
$mqttHost   = "50.62.182.131"
$mqttPort   = 1883
$mqttUser   = "maestro"
$clientId   = "zk-agent-$siteId"
$cmdTopic   = "zk/$siteId/cmd/pull"
$statusTopic= "zk/$siteId/status"

# Secretos desde archivo local (nunca en el script)
$token = $env:ZK_AGENT_TOKEN
if (-not $token -and (Test-Path "$sdk\token.txt")) { $token = (Get-Content "$sdk\token.txt" -Raw).Trim() }
$mqttPass = $env:ZK_MQTT_PASS
if (-not $mqttPass -and (Test-Path "$sdk\mqtt-pass.txt")) { $mqttPass = (Get-Content "$sdk\mqtt-pass.txt" -Raw).Trim() }

$StatusMap = @{
  0='autorizada';1='autorizada';2='autorizada';3='autorizada';4='autorizada';5='autorizada'
  8='autorizada';14='autorizada';15='autorizada';16='autorizada';17='autorizada';18='autorizada';19='autorizada'
  20='rechazada';22='rechazada';24='rechazada';25='rechazada';28='rechazada';23='denegada'
  27='desconocida';34='desconocida';29='vencida';33='vencida';30='invalida';26='multi_tarjeta'
}
$SystemEvents = @(200,201,202,204,205,206,220,221,255)
function Status([int]$e){ if($StatusMap.ContainsKey($e)){$StatusMap[$e]}else{'otro'} }

# ---------------- SDK ZKAccess ----------------
if (-not ("Pull" -as [type])) {
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class Pull {
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string p);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern IntPtr Connect(string s);
  [DllImport("plcommpro.dll")] public static extern void Disconnect(IntPtr h);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetDeviceData(IntPtr h, byte[] b, int n, string t, string f, string c, string o);
  [DllImport("plcommpro.dll")] public static extern int PullLastError();
}
"@
}
[Pull]::SetDllDirectory($sdk) | Out-Null

function Read-Buf($b){ $i=[Array]::IndexOf($b,[byte]0); if($i -lt 0){$i=$b.Length}; [Text.Encoding]::UTF8.GetString($b,0,$i) }
function ZKTime([long]$v){
  $y=[math]::Floor($v/32140800)+2000; $mo=[math]::Floor($v/2678400)%12+1; $d=[math]::Floor($v/86400)%31+1
  $h=[math]::Floor($v/3600)%24; $mi=[math]::Floor($v/60)%60; $s=$v%60
  '{0:d4}-{1:d2}-{2:d2} {3:d2}:{4:d2}:{5:d2}' -f [int]$y,[int]$mo,[int]$d,[int]$h,[int]$mi,[int]$s
}
function NowZK { $d=[datetime]::Now; [long]((((($d.Year-2000)*12*31)+($d.Month-1)*31+($d.Day-1))*86400)+$d.Hour*3600+$d.Minute*60+$d.Second) }

# ---------------- Accion: pull + limpieza + subida en lotes ----------------
function Invoke-Pull {
  $h = [Pull]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
  if ($h -eq [IntPtr]::Zero){ return @{ ok=$false; error="connect $([Pull]::PullLastError())" } }
  $b = New-Object byte[] (4MB)
  $rc = [Pull]::GetDeviceData($h, $b, $b.Length, "transaction", "*", "", "")
  [Pull]::Disconnect($h)
  if ($rc -lt 0){ return @{ ok=$false; error="getdata $rc" } }

  $lines = (Read-Buf $b) -split "`r`n" | Where-Object {$_}
  $hd = $lines[0] -split ","
  $iCard=[Array]::IndexOf($hd,"Cardno"); $iPin=[Array]::IndexOf($hd,"Pin"); $iTime=[Array]::IndexOf($hd,"Time_second")
  $iEvt=[Array]::IndexOf($hd,"EventType"); $iDoor=[Array]::IndexOf($hd,"DoorID"); $iIO=[Array]::IndexOf($hd,"InOutState")

  if (-not (Test-Path $cursorFile)) {
    $seed = ($lines | Select-Object -Skip 1 | ForEach-Object { [long](($_ -split ",")[$iTime]) } | Measure-Object -Maximum).Maximum
    Set-Content -Path $cursorFile -Value $seed
    return @{ ok=$true; seeded=$seed; new=0; clean=0; sent=0 }
  }
  $cursor = [long](Get-Content $cursorFile -Raw).Trim()
  $allMax = ($lines | Select-Object -Skip 1 | ForEach-Object { [long](($_ -split ",")[$iTime]) } | Measure-Object -Maximum).Maximum
  $cap = [Math]::Max($allMax, (NowZK)) - $GuardSec

  $rows = foreach($l in ($lines | Select-Object -Skip 1)){
    $c = $l -split ","; $t=[long]$c[$iTime]; $e=[int]$c[$iEvt]
    if ($t -gt $cursor -and $t -le $cap -and $SystemEvents -notcontains $e){
      [pscustomobject]@{ Pin=$c[$iPin]; Card=$c[$iCard]; T=$t; Evt=$e; Door=$c[$iDoor]; IO=$c[$iIO] }
    }
  }
  if (-not $rows){ return @{ ok=$true; new=0; clean=0; sent=0 } }

  $lastSeen = @{}
  $clean = @(foreach($r in ($rows | Sort-Object T)){
    if (-not $lastSeen.ContainsKey($r.Card) -or ($r.T - $lastSeen[$r.Card]) -gt $WindowSec){ $lastSeen[$r.Card] = $r.T; $r }
  })

  $sorted = @($clean | Sort-Object T)
  $sent = 0
  for($off=0; $off -lt $sorted.Count; $off += $BatchSize){
    $end = [Math]::Min($off+$BatchSize-1, $sorted.Count-1)
    $chunk = $sorted[$off..$end]
    $lecturas = $chunk | ForEach-Object {
      $idKey = if($_.Pin -ne '0'){$_.Pin}else{$_.Card}
      [pscustomobject]@{ event_key="{0}|{1}|{2}" -f $siteId,$idKey,$_.T; timestamp=ZKTime $_.T;
        pin=$_.Pin; card_raw=$_.Card; door=[int]$_.Door; event_type=[int]$_.Evt; estatus=Status([int]$_.Evt) }
    }
    $payload = [pscustomobject]@{ site_id=$siteId; controller=@{ ip=$ip }; lecturas=@($lecturas) } | ConvertTo-Json -Depth 5
    $chunkMaxT = ($chunk | Measure-Object T -Maximum).Maximum
    try {
      Invoke-RestMethod -Uri $server -Method Post -Body $payload -ContentType 'application/json' -Headers @{ 'X-Agent-Token'=$token } | Out-Null
      $sent += $chunk.Count
      Set-Content -Path $cursorFile -Value $chunkMaxT
    } catch {
      return @{ ok=$false; error=$_.Exception.Message; new=$rows.Count; clean=$clean.Count; sent=$sent }
    }
  }
  return @{ ok=$true; new=$rows.Count; clean=$clean.Count; sent=$sent }
}

# ---------------- MQTT ----------------
Add-Type -Path "$sdk\M2Mqtt.Net.dll"
$sync = [hashtable]::Synchronized(@{ pending=$false })

function Connect-Mqtt {
  $c = New-Object uPLibrary.Networking.M2Mqtt.MqttClient($mqttHost, [int]$mqttPort, $false, $null, $null, [uPLibrary.Networking.M2Mqtt.MqttSslProtocols]::None)
  $willMsg = '{"agent":"' + $clientId + '","state":"offline"}'
  $c.Connect($clientId, $mqttUser, $mqttPass, $true, [byte]1, $true, $statusTopic, $willMsg, $true, 60) | Out-Null
  Register-ObjectEvent -InputObject $c -EventName MqttMsgPublishReceived -MessageData $sync -Action {
    $Event.MessageData.pending = $true
  } | Out-Null
  $c.Subscribe([string[]]@($cmdTopic), [byte[]]@(1)) | Out-Null
  $c.Publish($statusTopic, [Text.Encoding]::UTF8.GetBytes('{"agent":"'+$clientId+'","state":"online"}'), [byte]1, $true) | Out-Null
  Write-Host "$(Get-Date -Format s) MQTT conectado. Escuchando '$cmdTopic'." -ForegroundColor Green
  return $c
}

$client = Connect-Mqtt
while ($true) {
  if (-not $client.IsConnected) {
    Write-Host "$(Get-Date -Format s) MQTT desconectado; reintentando en 5s..." -ForegroundColor Yellow
    Start-Sleep 5
    try { $client = Connect-Mqtt } catch { continue }
  }
  if ($sync.pending) {
    $sync.pending = $false
    Write-Host "$(Get-Date -Format s) Orden recibida -> pull..." -ForegroundColor Cyan
    $r = Invoke-Pull
    $r.agent = $clientId; $r.ts = (Get-Date -Format s)
    $msg = ($r | ConvertTo-Json -Compress)
    try { $client.Publish($statusTopic, [Text.Encoding]::UTF8.GetBytes($msg), [byte]1, $false) | Out-Null } catch {}
    Write-Host "  Resultado: $msg" -ForegroundColor Green
  }
  Start-Sleep -Milliseconds 400
}
