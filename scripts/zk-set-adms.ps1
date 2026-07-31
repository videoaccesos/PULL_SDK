# zk-set-adms.ps1 - configura (o REVIERTE) el modo servidor ADMS/PUSH del C3.
# *** INVASIVO: cambia la configuracion de un panel en produccion. ***
# Ejecutar en PowerShell de 32 bits. Hacerlo en ventana de baja afluencia.
# Revertir siempre con $mode="off" al terminar la prueba.

$sdk="C:\agente-zk"; $ip="192.168.1.151"
$mode        = "on"              # "on" = apuntar al catcher | "off" = revertir
$catcherIp   = "50.62.182.131"   # servidor Ubuntu publico de videoaccesos
$catcherPort = 8085

Add-Type @"
using System; using System.Runtime.InteropServices;
public static class PullS {
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string p);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern IntPtr Connect(string s);
  [DllImport("plcommpro.dll")] public static extern void Disconnect(IntPtr h);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int SetDeviceParam(IntPtr h, string items);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetDeviceParam(IntPtr h, byte[] b, int n, string items);
}
"@
[PullS]::SetDllDirectory($sdk) | Out-Null
$h=[PullS]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
if($h -eq [IntPtr]::Zero){ Write-Host "FALLO Connect" -ForegroundColor Red; return }

if($mode -eq "on"){
  $items = "WebServerIP=$catcherIp,WebServerPort=$catcherPort,EnableServerMode=1"
} else {
  $items = "WebServerIP=,WebServerPort=,EnableServerMode=0"
}
$rc = [PullS]::SetDeviceParam($h, $items)
Write-Host "SetDeviceParam('$items') -> rc=$rc" -ForegroundColor $(if($rc -lt 0){"Red"}else{"Green"})

# Releer para confirmar
foreach($p in @("WebServerIP","WebServerPort","EnableServerMode")){
  $b=New-Object byte[] 1024
  [PullS]::GetDeviceParam($h,$b,$b.Length,$p) | Out-Null
  $i=[Array]::IndexOf($b,[byte]0); if($i -lt 0){$i=$b.Length}
  Write-Host ("  " + [Text.Encoding]::ASCII.GetString($b,0,$i))
}
[PullS]::Disconnect($h)
Write-Host "Listo. Si es prueba, recuerda revertir con `$mode='off'." -ForegroundColor Yellow
