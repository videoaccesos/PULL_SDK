# zk-pull-upload.ps1 - accion on-demand: baja lecturas NUEVAS del panel, las limpia
# (relecturas de la misma tarjeta dentro de 5s = 1), clasifica por estatus y las sube.
# Ejecutar en PowerShell de 32 bits. Mismo formato que reporter.py.

# --- Config ---
$sdk       = "C:\agente-zk"
$ip        = "192.168.1.151"
$siteId    = "INTERLOMAS"
$server    = "http://50.62.182.131:8085/api/zk/lecturas"   # vacio = guarda a archivo
$token     = "TEST"                                        # X-Agent-Token del sitio
$WindowSec = 5      # relecturas de la misma tarjeta dentro de esta ventana = 1
$cursorFile = "$sdk\zk-cursor-$($ip.Replace('.','_')).txt"
$outFile    = "$sdk\zk-lecturas-$($ip.Replace('.','_')).json"

# event_type -> estatus
$StatusMap = @{
  0='autorizada';1='autorizada';2='autorizada';3='autorizada';4='autorizada';5='autorizada'
  8='autorizada';14='autorizada';15='autorizada';16='autorizada';17='autorizada';18='autorizada';19='autorizada'
  20='rechazada';22='rechazada';24='rechazada';25='rechazada';28='rechazada';23='denegada'
  27='desconocida';34='desconocida';29='vencida';33='vencida';30='invalida';26='multi_tarjeta'
}
$SystemEvents = @(200,201,202,204,205,206,220,221,255)
function Status([int]$e){ if($StatusMap.ContainsKey($e)){$StatusMap[$e]}else{'otro'} }

if (-not ("Pull" -as [type])) {
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Pull {
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string p);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern IntPtr Connect(string s);
  [DllImport("plcommpro.dll")] public static extern void Disconnect(IntPtr h);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetDeviceData(IntPtr h, byte[] b, int n, string t, string f, string c, string o);
  [DllImport("plcommpro.dll")] public static extern int PullLastError();
}
"@
}

function Read-Buf($b){ $i=[Array]::IndexOf($b,[byte]0); if($i -lt 0){$i=$b.Length}; [Text.Encoding]::UTF8.GetString($b,0,$i) }
function ZKTime([long]$v){
  $y=[math]::Floor($v/32140800)+2000; $mo=[math]::Floor($v/2678400)%12+1; $d=[math]::Floor($v/86400)%31+1
  $h=[math]::Floor($v/3600)%24; $mi=[math]::Floor($v/60)%60; $s=$v%60
  '{0:d4}-{1:d2}-{2:d2} {3:d2}:{4:d2}:{5:d2}' -f [int]$y,[int]$mo,[int]$d,[int]$h,[int]$mi,[int]$s
}

[Pull]::SetDllDirectory($sdk) | Out-Null
$h = [Pull]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
if ($h -eq [IntPtr]::Zero){ Write-Host "FALLO Connect: $([Pull]::PullLastError())" -ForegroundColor Red; return }

$b = New-Object byte[] (4MB)
$rc = [Pull]::GetDeviceData($h, $b, $b.Length, "transaction", "*", "", "")
[Pull]::Disconnect($h)
if ($rc -lt 0){ Write-Host "GetDeviceData error: $rc (si -106: tabla >4MB, paginar por fecha)" -ForegroundColor Red; return }

$lines = (Read-Buf $b) -split "`r`n" | Where-Object {$_}
$headers = $lines[0] -split ","
$iCard=[Array]::IndexOf($headers,"Cardno"); $iPin=[Array]::IndexOf($headers,"Pin"); $iTime=[Array]::IndexOf($headers,"Time_second")
$iEvt=[Array]::IndexOf($headers,"EventType"); $iDoor=[Array]::IndexOf($headers,"DoorID"); $iIO=[Array]::IndexOf($headers,"InOutState")

# --- Cursor. Primera corrida: sembrar en el maximo actual para NO volcar el historico ---
if (-not (Test-Path $cursorFile)) {
  $seed = ($lines | Select-Object -Skip 1 | ForEach-Object { [long](($_ -split ",")[$iTime]) } | Measure-Object -Maximum).Maximum
  Set-Content -Path $cursorFile -Value $seed
  Write-Host "Primera corrida: cursor sembrado en $seed (=ahora). Pasa tarjetas y corre de nuevo." -ForegroundColor Yellow
  Write-Host "(Para importar TODO el historico: pon 0 en $cursorFile)" -ForegroundColor DarkGray
  return
}
$cursor = [long](Get-Content $cursorFile -Raw).Trim()
Write-Host "Cursor previo (Time_second): $cursor" -ForegroundColor DarkGray

# Solo NUEVOS (T > cursor) y excluyendo eventos de sistema (sin tarjeta)
$rows = foreach($l in ($lines | Select-Object -Skip 1)){
  $c = $l -split ","; $t=[long]$c[$iTime]; $e=[int]$c[$iEvt]
  if ($t -gt $cursor -and $SystemEvents -notcontains $e){
    [pscustomobject]@{ Pin=$c[$iPin]; Card=$c[$iCard]; T=$t; Evt=$e; Door=$c[$iDoor]; IO=$c[$iIO] }
  }
}
Write-Host "Lecturas nuevas (crudas): $($rows.Count)" -ForegroundColor Cyan
if (-not $rows){ Write-Host "Nada nuevo." -ForegroundColor Yellow; return }

# Limpieza: dedup deslizante por TARJETA (misma tarjeta dentro de WindowSec = 1)
$last = @{}
$clean = foreach($r in ($rows | Sort-Object T)){
  if (-not $last.ContainsKey($r.Card) -or ($r.T - $last[$r.Card]) -gt $WindowSec){
    $last[$r.Card] = $r.T
    $r
  }
}
Write-Host "Tras limpieza (ventana ${WindowSec}s): $($clean.Count)" -ForegroundColor Green

# Payload (llave = Pin; card_raw referencia; estatus por event_type)
$lecturas = $clean | Sort-Object T | ForEach-Object {
  $idKey = if($_.Pin -ne '0'){$_.Pin}else{$_.Card}
  [pscustomobject]@{
    event_key = "{0}|{1}|{2}" -f $siteId, $idKey, $_.T
    timestamp = ZKTime $_.T
    pin       = $_.Pin
    card_raw  = $_.Card
    door      = [int]$_.Door
    event_type= [int]$_.Evt
    estatus   = Status ([int]$_.Evt)
  }
}
$payload = [pscustomobject]@{ site_id=$siteId; controller=@{ ip=$ip }; lecturas=$lecturas } | ConvertTo-Json -Depth 5

$maxT = ($clean | Measure-Object T -Maximum).Maximum
if ($server){
  try {
    $resp = Invoke-RestMethod -Uri $server -Method Post -Body $payload -ContentType 'application/json' -Headers @{ 'X-Agent-Token'=$token }
    Write-Host "Subido OK. Respuesta: $($resp | ConvertTo-Json -Compress)" -ForegroundColor Green
    Set-Content -Path $cursorFile -Value $maxT
    Write-Host "Cursor avanzado a $maxT" -ForegroundColor DarkGray
  } catch {
    Write-Host "FALLO al subir: $($_.Exception.Message). No se avanza el cursor." -ForegroundColor Red
  }
} else {
  Set-Content -Path $outFile -Value $payload
  Write-Host "Sin servidor: payload guardado en $outFile" -ForegroundColor Yellow
}
