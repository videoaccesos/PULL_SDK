# zk-agent-mqtt.ps1 - agente local que ESPERA una orden por MQTT y entonces
# baja lecturas nuevas, deduplica y las sube al servidor.
# Ejecutar en PowerShell de 32 bits. Debe quedarse corriendo (ventana o tarea).

# ---------------- Config ----------------
$sdk       = "C:\agente-zk"
$ip        = "192.168.1.151"
$siteId    = "INTERLOMAS"
$WindowSec = 300

# Servidor de lecturas (HTTP)
$server    = ""   # p.ej. "https://api.videoaccesos.com/api/zk/lecturas" (vacio = guarda a archivo)
$token     = ""   # X-Agent-Token

# MQTT  (AJUSTAR a los mismos valores que usa el CaptureAgent)
$mqttDll   = "$sdk\M2Mqtt.Net.dll"          # coloca aqui la DLL de M2Mqtt
$broker    = "broker.videoaccesos.com"
$mqttPort  = 1883
$mqttUser  = ""
$mqttPass  = ""
$clientId  = "zk-agent-$siteId"
$cmdTopic  = "zk/$siteId/cmd/pull"          # el boton publica aqui para disparar
$statusTopic = "zk/$siteId/status"          # el agente publica resultado/heartbeat aqui

$cursorFile = "$sdk\zk-cursor-$($ip.Replace('.','_')).txt"
$outFile    = "$sdk\zk-lecturas-$($ip.Replace('.','_')).json"

# ---------------- SDK ZKAccess ----------------
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Pull {
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string p);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern IntPtr Connect(string s);
  [DllImport("plcommpro.dll")] public static extern void Disconnect(IntPtr h);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetDeviceData(IntPtr h, byte[] b, int n, string t, string f, string c, string o);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetDeviceDataCount(IntPtr h, string t, string filter, string o);
  [DllImport("plcommpro.dll")] public static extern int PullLastError();
}
"@
[Pull]::SetDllDirectory($sdk) | Out-Null

function Read-Buf($b){ $i=[Array]::IndexOf($b,[byte]0); if($i -lt 0){$i=$b.Length}; [Text.Encoding]::UTF8.GetString($b,0,$i) }
function ZKTime([long]$v){
  $y=[math]::Floor($v/32140800)+2000; $mo=[math]::Floor($v/2678400)%12+1; $d=[math]::Floor($v/86400)%31+1
  $h=[math]::Floor($v/3600)%24; $mi=[math]::Floor($v/60)%60; $s=$v%60
  '{0:d4}-{1:d2}-{2:d2} {3:d2}:{4:d2}:{5:d2}' -f [int]$y,[int]$mo,[int]$d,[int]$h,[int]$mi,[int]$s
}

# ---------------- Accion: pull + dedup + upload ----------------
function Invoke-ZKPull {
  $cursor = 0L
  if (Test-Path $cursorFile) { $cursor = [long](Get-Content $cursorFile -Raw).Trim() }

  $h = [Pull]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
  if ($h -eq [IntPtr]::Zero){ return @{ ok=$false; error="connect $([Pull]::PullLastError())" } }
  $b = New-Object byte[] (4MB)
  $rc = [Pull]::GetDeviceData($h, $b, $b.Length, "transaction", "*", "", "")
  [Pull]::Disconnect($h)
  if ($rc -lt 0){ return @{ ok=$false; error="getdata $rc" } }

  $lines = (Read-Buf $b) -split "`r`n" | Where-Object {$_}
  $hd = $lines[0] -split ","
  $iCard=[Array]::IndexOf($hd,"Cardno"); $iTime=[Array]::IndexOf($hd,"Time_second")
  $iEvt=[Array]::IndexOf($hd,"EventType"); $iDoor=[Array]::IndexOf($hd,"DoorID"); $iIO=[Array]::IndexOf($hd,"InOutState")

  $rows = foreach($l in ($lines | Select-Object -Skip 1)){
    $c=$l -split ","; $t=[long]$c[$iTime]
    if ($t -gt $cursor){ [pscustomobject]@{ Card=$c[$iCard]; T=$t; Evt=$c[$iEvt]; Door=$c[$iDoor]; IO=$c[$iIO] } }
  }
  if (-not $rows){ return @{ ok=$true; new=0; clean=0; uploaded=$false } }

  $clean = $rows | Group-Object { "{0}|{1}" -f $_.Card, [math]::Floor($_.T/$WindowSec) } |
           ForEach-Object { $_.Group | Sort-Object T -Descending | Select-Object -First 1 }

  $lecturas = $clean | Sort-Object T | ForEach-Object {
    [pscustomobject]@{
      event_key="{0}|{1}|{2}" -f $ip,$_.Card,$_.T; timestamp=ZKTime $_.T
      card=$_.Card; door=[int]$_.Door; event_type=[int]$_.Evt
      direction=@('entry','exit','none')[[int]$_.IO]
    }
  }
  $payload = [pscustomobject]@{ site_id=$siteId; controller=@{ ip=$ip }; lecturas=$lecturas } | ConvertTo-Json -Depth 5
  $maxT = ($clean | Measure-Object T -Maximum).Maximum

  if ($server){
    try {
      Invoke-RestMethod -Uri $server -Method Post -Body $payload -ContentType 'application/json' -Headers @{ 'X-Agent-Token'=$token } | Out-Null
      Set-Content -Path $cursorFile -Value $maxT
      return @{ ok=$true; new=$rows.Count; clean=$clean.Count; uploaded=$true }
    } catch { return @{ ok=$false; error=$_.Exception.Message; new=$rows.Count; clean=$clean.Count } }
  } else {
    Set-Content -Path $outFile -Value $payload
    return @{ ok=$true; new=$rows.Count; clean=$clean.Count; uploaded=$false; saved=$outFile }
  }
}

# ---------------- MQTT ----------------
Add-Type -Path $mqttDll
$sync = [hashtable]::Synchronized(@{ pending=$false })

function Connect-Mqtt {
  $c = New-Object uPLibrary.Networking.M2Mqtt.MqttClient($broker, $mqttPort, $false, $null, $null, [uPLibrary.Networking.M2Mqtt.MqttSslProtocols]::None)
  # LWT: publica 'offline' si el agente cae
  $c.Connect($clientId, $mqttUser, $mqttPass, $true, [byte]1, $true, $statusTopic,
             '{"agent":"'+$clientId+'","state":"offline"}', $true, 60) | Out-Null
  Register-ObjectEvent -InputObject $c -EventName MqttMsgPublishReceived -MessageData $sync -Action {
    $Event.MessageData.pending = $true
  } | Out-Null
  $c.Subscribe(@($cmdTopic), @([byte]1)) | Out-Null
  $c.Publish($statusTopic, [Text.Encoding]::UTF8.GetBytes('{"agent":"'+$clientId+'","state":"online"}'), [byte]1, $true) | Out-Null
  Write-Host "MQTT conectado. Escuchando '$cmdTopic'..." -ForegroundColor Green
  return $c
}

$client = Connect-Mqtt
while ($true) {
  if (-not $client.IsConnected) {
    Write-Host "MQTT desconectado; reintentando en 5s..." -ForegroundColor Yellow
    Start-Sleep 5
    try { $client = Connect-Mqtt } catch { continue }
  }
  if ($sync.pending) {
    $sync.pending = $false
    Write-Host "[$([datetime]::Now.ToString('HH:mm:ss'))] Orden recibida -> ejecutando pull..." -ForegroundColor Cyan
    $r = Invoke-ZKPull
    $r.agent = $clientId; $r.ts = (ZKTime 0)  # ts real lo pone el server; aqui solo marca
    $msg = ($r | ConvertTo-Json -Compress)
    $client.Publish($statusTopic, [Text.Encoding]::UTF8.GetBytes($msg), [byte]1, $false) | Out-Null
    Write-Host "Resultado: $msg" -ForegroundColor Green
  }
  Start-Sleep -Milliseconds 400
}
