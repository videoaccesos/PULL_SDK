# zk-pull-upload.ps1 - accion on-demand: baja lecturas NUEVas, deduplica y sube.
# Pensado para dispararse desde un boton. Ejecutar en PowerShell de 32 bits.

# --- Config ---
$sdk       = "C:\agente-zk"
$ip        = "192.168.1.151"
$siteId    = "INTERLOMAS"
$server    = ""   # p.ej. "https://api.videoaccesos.com/api/zk/lecturas"  (vacio = guarda a archivo)
$token     = ""   # X-Agent-Token del sitio
$WindowSec = 300  # dedup: misma tarjeta dentro de esta ventana = 1
$cursorFile = "$sdk\zk-cursor-$($ip.Replace('.','_')).txt"
$outFile    = "$sdk\zk-lecturas-$($ip.Replace('.','_')).json"

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

function Read-Buf($b){ $i=[Array]::IndexOf($b,[byte]0); if($i -lt 0){$i=$b.Length}; [Text.Encoding]::UTF8.GetString($b,0,$i) }
function ZKTime([long]$v){
  $y=[math]::Floor($v/32140800)+2000; $mo=[math]::Floor($v/2678400)%12+1; $d=[math]::Floor($v/86400)%31+1
  $h=[math]::Floor($v/3600)%24; $mi=[math]::Floor($v/60)%60; $s=$v%60
  '{0:d4}-{1:d2}-{2:d2} {3:d2}:{4:d2}:{5:d2}' -f [int]$y,[int]$mo,[int]$d,[int]$h,[int]$mi,[int]$s
}

# --- Cursor: ultima Time_second ya procesada ---
$cursor = 0L
if (Test-Path $cursorFile) { $cursor = [long](Get-Content $cursorFile -Raw).Trim() }
Write-Host "Cursor previo (Time_second): $cursor" -ForegroundColor DarkGray

[Pull]::SetDllDirectory($sdk) | Out-Null
$h = [Pull]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
if ($h -eq [IntPtr]::Zero){ Write-Host "FALLO Connect: $([Pull]::PullLastError())" -ForegroundColor Red; return }

$total = [Pull]::GetDeviceDataCount($h, "transaction", "", "")
Write-Host "Registros totales en 'transaction': $total"

$b = New-Object byte[] (4MB)
$rc = [Pull]::GetDeviceData($h, $b, $b.Length, "transaction", "*", "", "")
[Pull]::Disconnect($h)
if ($rc -lt 0){ Write-Host "GetDeviceData error: $rc (si -106: tabla >4MB, hay que paginar por fecha)" -ForegroundColor Red; return }

$lines = (Read-Buf $b) -split "`r`n" | Where-Object {$_}
$headers = $lines[0] -split ","
$iCard=[Array]::IndexOf($headers,"Cardno"); $iPin=[Array]::IndexOf($headers,"Pin"); $iTime=[Array]::IndexOf($headers,"Time_second")
$iEvt=[Array]::IndexOf($headers,"EventType"); $iDoor=[Array]::IndexOf($headers,"DoorID"); $iIO=[Array]::IndexOf($headers,"InOutState")

# Solo NUEVOS (T > cursor)
$rows = foreach($l in ($lines | Select-Object -Skip 1)){
  $c = $l -split ","; $t=[long]$c[$iTime]
  if ($t -gt $cursor){ [pscustomobject]@{ Pin=$c[$iPin]; Card=$c[$iCard]; T=$t; Evt=$c[$iEvt]; Door=$c[$iDoor]; IO=$c[$iIO] } }
}
Write-Host "Lecturas nuevas: $($rows.Count)" -ForegroundColor Cyan
if (-not $rows){ Write-Host "Nada nuevo que subir." -ForegroundColor Yellow; return }

# Dedup: mismo residente (Pin) dentro de la misma ventana = 1 (la mas reciente).
# Si Pin=0 (tarjeta no enrolada) se agrupa por Card para no mezclar distintas.
$clean = $rows | Group-Object { $k = if($_.Pin -ne '0'){"p"+$_.Pin}else{"c"+$_.Card}; "{0}|{1}" -f $k, [math]::Floor($_.T/$WindowSec) } |
         ForEach-Object { $_.Group | Sort-Object T -Descending | Select-Object -First 1 }
Write-Host "Tras dedup (ventana ${WindowSec}s): $($clean.Count)" -ForegroundColor Green

# Payload - la LLAVE es Pin (identifica al residente via padron); card_raw solo referencia.
$lecturas = $clean | Sort-Object T | ForEach-Object {
  $idKey = if($_.Pin -ne '0'){$_.Pin}else{$_.Card}
  [pscustomobject]@{
    event_key = "{0}|{1}|{2}" -f $siteId, $idKey, $_.T
    timestamp = ZKTime $_.T
    pin       = $_.Pin
    card_raw  = $_.Card
    door      = [int]$_.Door
    event_type= [int]$_.Evt
    direction = @('entry','exit','none')[[int]$_.IO]
  }
}
$payload = [pscustomobject]@{ site_id=$siteId; controller=@{ ip=$ip }; lecturas=$lecturas } | ConvertTo-Json -Depth 5

# Subir o guardar
$maxT = ($clean | Measure-Object T -Maximum).Maximum
if ($server){
  try {
    $resp = Invoke-RestMethod -Uri $server -Method Post -Body $payload -ContentType 'application/json' -Headers @{ 'X-Agent-Token'=$token }
    Write-Host "Subido OK. Respuesta: $($resp | ConvertTo-Json -Compress)" -ForegroundColor Green
    Set-Content -Path $cursorFile -Value $maxT   # avanzar cursor solo si subio bien
    Write-Host "Cursor avanzado a $maxT" -ForegroundColor DarkGray
  } catch {
    Write-Host "FALLO al subir: $($_.Exception.Message). No se avanza el cursor." -ForegroundColor Red
  }
} else {
  Set-Content -Path $outFile -Value $payload
  Write-Host "Sin servidor configurado: payload guardado en $outFile" -ForegroundColor Yellow
  Write-Host "(No se avanza el cursor hasta que haya subida real.)" -ForegroundColor DarkGray
}
