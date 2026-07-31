# zktransactions.ps1 - baja la tabla 'transaction', decodifica el tiempo y
# deduplica numeros de tarjeta por ventana. Ejecutar en PowerShell de 32 bits.

$sdk = "C:\agente-zk"
$ip  = "192.168.1.151"
$WindowSec = 300   # ventana de dedup: misma tarjeta dentro de 5 min = 1 registro

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

[Pull]::SetDllDirectory($sdk) | Out-Null
$h = [Pull]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
if ($h -eq [IntPtr]::Zero){ Write-Host "FALLO Connect: $([Pull]::PullLastError())" -ForegroundColor Red; return }

$total = [Pull]::GetDeviceDataCount($h, "transaction", "", "")
Write-Host "Total de registros en 'transaction': $total" -ForegroundColor Cyan

$b = New-Object byte[] (4MB)
$rc = [Pull]::GetDeviceData($h, $b, $b.Length, "transaction", "*", "", "")
if ($rc -lt 0){ Write-Host "GetDeviceData error: $rc (si es -106, la tabla excede 4MB; hay que paginar por fecha)" -ForegroundColor Red; [Pull]::Disconnect($h); return }

$lines = (Read-Buf $b) -split "`r`n" | Where-Object {$_}
$headers = $lines[0] -split ","
Write-Host "Encabezados: $($lines[0])" -ForegroundColor Yellow
$idxCard = [Array]::IndexOf($headers,"Cardno")
$idxTime = [Array]::IndexOf($headers,"Time_second")
$idxEvt  = [Array]::IndexOf($headers,"EventType")
$idxDoor = [Array]::IndexOf($headers,"DoorID")

$rows = foreach($l in ($lines | Select-Object -Skip 1)){
  $c = $l -split ","
  [pscustomobject]@{ Card=$c[$idxCard]; T=[long]$c[$idxTime]; Evt=$c[$idxEvt]; Door=$c[$idxDoor] }
}
Write-Host "Filas parseadas: $($rows.Count)"

Write-Host "`n--- Ultimas 15 lecturas ---" -ForegroundColor Cyan
$rows | Sort-Object T -Descending | Select-Object -First 15 | ForEach-Object {
  "{0} | card={1} | door={2} | type={3}" -f (ZKTime $_.T), $_.Card, $_.Door, $_.Evt
}

# Dedup: misma tarjeta dentro de la misma ventana de WindowSec = 1
$dedup = $rows | Group-Object { "{0}|{1}" -f $_.Card, [math]::Floor($_.T/$WindowSec) } | ForEach-Object { $_.Group[0] }
Write-Host "`nTarjetas unicas (dedup ventana ${WindowSec}s): $($dedup.Count) de $($rows.Count) lecturas" -ForegroundColor Green
$dedup | Sort-Object T -Descending | Select-Object -First 15 | ForEach-Object {
  "{0} | card={1} | door={2}" -f (ZKTime $_.T), $_.Card, $_.Door
}

[Pull]::Disconnect($h)
Write-Host "`nDesconectado." -ForegroundColor Green
