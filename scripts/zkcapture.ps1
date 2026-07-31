# zkcapture.ps1 - captura autonoma de lecturas y tarjetas de un panel ZKAccess C3
# Ejecutar en PowerShell de 32 bits. Ajusta $sdk e $ip si cambian.

$sdk = "C:\agente-zk"
$ip  = "192.168.1.151"

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Pull {
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string p);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern IntPtr Connect(string s);
  [DllImport("plcommpro.dll")] public static extern void Disconnect(IntPtr h);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetRTLog(IntPtr h, byte[] b, int n);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetDeviceData(IntPtr h, byte[] b, int n, string t, string f, string c, string o);
  [DllImport("plcommpro.dll")] public static extern int PullLastError();
}
"@

function Read-Buf($b){ $i=[Array]::IndexOf($b,[byte]0); if($i -lt 0){$i=$b.Length}; [Text.Encoding]::UTF8.GetString($b,0,$i) }

[Pull]::SetDllDirectory($sdk) | Out-Null
$h = [Pull]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
if ($h -eq [IntPtr]::Zero) { Write-Host "FALLO Connect: $([Pull]::PullLastError())" -ForegroundColor Red; return }
Write-Host "Conectado (handle=$h). Escuchando 40s. Pasa tarjetas de residentes AHORA..." -ForegroundColor Green

$fin = (Get-Date).AddSeconds(40)
while ((Get-Date) -lt $fin) {
  $b = New-Object byte[] 65536
  $null = [Pull]::GetRTLog($h, $b, $b.Length)
  foreach ($l in ((Read-Buf $b) -split "`r`n")) {
    if ($l -and (($l -split ",")[4] -ne "255")) {
      $p = $l -split ","
      Write-Host ("EVENTO crudo: {0}" -f $l) -ForegroundColor Gray
      Write-Host ("   -> hora={0} card={1} door={2} type={3} dir={4} verify={5}" -f $p[0],$p[2],$p[3],$p[4],$p[5],$p[6])
    }
  }
  Start-Sleep -Milliseconds 500
}

Write-Host "`n--- Primeras 15 tarjetas del padron (tabla user) ---" -ForegroundColor Cyan
$b = New-Object byte[] (4MB)
$null = [Pull]::GetDeviceData($h, $b, $b.Length, "user", "*", "", "")
(Read-Buf $b) -split "`r`n" | Where-Object {$_} | Select-Object -First 15

[Pull]::Disconnect($h)
Write-Host "`nDesconectado." -ForegroundColor Green
