# iclock-catcher.ps1 - servidor minimo que REGISTRA lo que el C3 postea en modo ADMS/PUSH.
# NO usa plcommpro; corre en PowerShell normal. REQUIERE ejecutar como ADMINISTRADOR (HttpListener).
# Objetivo: observar el protocolo real del panel. Responde lo minimo para que el equipo siga hablando.

$port = 8080
$logFile = "C:\agente-zk\iclock-log.txt"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
try { $listener.Start() } catch { Write-Host "No se pudo abrir el puerto $port (corre como Administrador y permite el firewall). $_" -ForegroundColor Red; return }
Write-Host "iclock-catcher escuchando en http://0.0.0.0:$port/  (Ctrl+C para parar)" -ForegroundColor Green
"$(Get-Date -Format s) === START ===" | Out-File $logFile -Append

while ($true) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $body = ""
  if ($req.HasEntityBody) {
    $sr = New-Object System.IO.StreamReader($req.InputStream, $req.ContentEncoding)
    $body = $sr.ReadToEnd(); $sr.Close()
  }
  $line = "{0} {1} {2}{3}" -f (Get-Date -Format s), $req.HttpMethod, $req.Url.AbsolutePath, $req.Url.Query
  Write-Host $line -ForegroundColor Cyan
  if ($body) { Write-Host $body -ForegroundColor Gray }
  ("=== $line") | Out-File $logFile -Append
  if ($body) { $body | Out-File $logFile -Append }

  # Respuesta minima estilo iclock
  $path = $req.Url.AbsolutePath.ToLower()
  $resp = "OK"
  if ($req.HttpMethod -eq "GET" -and $path -like "*cdata*") {
    $sn = (($req.Url.Query -split "SN=")[1] -split "&")[0]
    $resp = "GET OPTION FROM: $sn`r`nStamp=9999`r`nOpStamp=9999`r`nErrorDelay=30`r`nDelay=10`r`nTransTimes=00:00;23:59`r`nTransInterval=1`r`nTransFlag=1111111111`r`nRealtime=1`r`nEncrypt=0`r`n"
  }
  elseif ($path -like "*getrequest*") { $resp = "OK" }
  elseif ($req.HttpMethod -eq "POST") { $resp = "OK: 1" }

  $bytes = [Text.Encoding]::ASCII.GetBytes($resp)
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.OutputStream.Close()
}
