# zk-buscar-tarjeta.ps1 - busca cards especificos en la tabla 'user' (padron).
# Usa clase PullB para no chocar con 'Pull' si ya existe en la sesion.
$sdk="C:\agente-zk"; $ip="192.168.1.151"
$cards = @("875575352","909324595","942749233","808792883")   # cards con event_type=0 (concedido)

Add-Type @"
using System; using System.Runtime.InteropServices;
public static class PullB {
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] public static extern bool SetDllDirectory(string p);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern IntPtr Connect(string s);
  [DllImport("plcommpro.dll")] public static extern void Disconnect(IntPtr h);
  [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)] public static extern int GetDeviceData(IntPtr h, byte[] b, int n, string t, string f, string c, string o);
}
"@
[PullB]::SetDllDirectory($sdk) | Out-Null
$h=[PullB]::Connect("protocol=TCP,ipaddress=$ip,port=4370,timeout=4000,passwd=")
foreach($card in $cards){
  $b=New-Object byte[] 262144
  [PullB]::GetDeviceData($h,$b,$b.Length,"user","*","CardNo=$card","") | Out-Null
  $i=[Array]::IndexOf($b,[byte]0); if($i -lt 0){$i=$b.Length}
  $r=([Text.Encoding]::UTF8.GetString($b,0,$i) -split "`r`n" | Where-Object {$_})
  Write-Host "== card $card ==" -ForegroundColor Cyan
  if($r.Count -le 1){ Write-Host "  NO encontrada en el padron" -ForegroundColor Red }
  else { $r | Select-Object -Skip 1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Green } }
}
[PullB]::Disconnect($h)
