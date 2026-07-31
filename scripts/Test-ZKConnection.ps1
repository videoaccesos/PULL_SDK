<#
.SYNOPSIS
    Diagnóstico de conexión y captura de datos de un panel ZKAccess C3 vía PULL SDK.

.DESCRIPTION
    Se ejecuta EN SITIO, en una PC dentro de la misma LAN que el panel ZKAccess,
    con el software/DLL de ZKAccess instalado. En una sola pasada:
      1) Prueba la conexión al panel (Connect).
      2) Captura lecturas en tiempo real (GetRTLog)         -> muestra I1 (crudo).
      3) Vuelca la tabla de tarjetas 'user' (GetDeviceData) -> muestra I2 (crudo).
      4) (Opcional) Vuelca históricos de la tabla 'transaction'.
    Todo se imprime EN CRUDO para que sirva como captura I1/I2/I4.

.NOTES
    ⚠️ REQUISITOS
    - plcommpro.dll es una DLL de 32 bits: EJECUTAR CON POWERSHELL DE 32 BITS:
        C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe
    - Los pl*.dll (plcommpro.dll, plcomms.dll, etc.) deben estar en -DllPath,
      normalmente la carpeta de instalación de ZKAccess.
    - Necesitas: IP del panel y contraseña de comunicación (si tiene).

.EXAMPLE
    # Desde PowerShell de 32 bits, en la carpeta del script:
    .\Test-ZKConnection.ps1 -Ip 192.168.5.60 -Password "" `
        -DllPath "C:\Program Files (x86)\ZKAccess3.5" -CaptureSeconds 30

    # Guardar la salida para compartirla:
    .\Test-ZKConnection.ps1 -Ip 192.168.5.60 -DllPath "C:\...\ZKAccess3.5" *> salida-interlomas.txt
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Ip,
    [string] $Password = "",
    [int]    $Port = 4370,
    [int]    $Timeout = 4000,
    [Parameter(Mandatory = $true)] [string] $DllPath,
    [int]    $CaptureSeconds = 30,
    [int]    $MaxCards = 20,
    [switch] $IncludeTransactions,
    [int]    $MaxTransactions = 20
)

$ErrorActionPreference = 'Stop'

# --- Verificar arquitectura (la DLL es de 32 bits) ---
if ([IntPtr]::Size -ne 4) {
    Write-Warning "Estas corriendo PowerShell de 64 bits. plcommpro.dll es de 32 bits y NO cargara."
    Write-Warning "Vuelve a ejecutar con: C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"
    return
}

# --- P/Invoke a plcommpro.dll ---
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class PullSDK {
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
    public static extern bool SetDllDirectory(string lpPathName);

    [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)]
    public static extern IntPtr Connect(string parameters);

    [DllImport("plcommpro.dll")]
    public static extern void Disconnect(IntPtr handle);

    [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)]
    public static extern int GetRTLog(IntPtr handle, byte[] buffer, int bufferSize);

    [DllImport("plcommpro.dll", CharSet=CharSet.Ansi)]
    public static extern int GetDeviceData(IntPtr handle, byte[] buffer, int bufferSize,
        string tableName, string fieldNames, string filter, string options);

    [DllImport("plcommpro.dll")]
    public static extern int PullLastError();
}
"@

function ConvertTo-SdkString([byte[]] $bytes) {
    $idx = [Array]::IndexOf($bytes, [byte]0)
    if ($idx -lt 0) { $idx = $bytes.Length }
    return [System.Text.Encoding]::UTF8.GetString($bytes, 0, $idx)
}

# Descripciones de event_type (subset relevante; ver zk-sdk-referencia-dev.md)
$EventTypes = @{
    0='Normal Punch Open'; 20='Too Short Punch Interval'; 22='Illegal Time Zone';
    23='Access Denied'; 26='Multi-Card Authentication'; 27='Unregistered Card';
    28='Opening Timeout'; 29='Card Expired'; 30='Password Error';
    200='Door Opened Correctly'; 201='Door Closed Correctly'; 202='Exit button Open';
    206='Device start'; 255='(estado puerta/alarma - descartar)'
}
$Directions = @{ '0'='entrada'; '1'='salida'; '2'='ninguno' }

Write-Host "=== Diagnostico ZKAccess PULL SDK ===" -ForegroundColor Cyan
Write-Host ("DLL path : {0}" -f $DllPath)
Write-Host ("Panel    : {0}:{1}" -f $Ip, $Port)
Write-Host ""

# Asegurar que Windows encuentre los pl*.dll dependientes
if (-not [PullSDK]::SetDllDirectory($DllPath)) {
    Write-Warning "SetDllDirectory fallo para '$DllPath'. Verifica la ruta."
}

$connstr = "protocol=TCP,ipaddress=$Ip,port=$Port,timeout=$Timeout,passwd=$Password"
Write-Host ("Conectando: protocol=TCP,ipaddress={0},port={1},timeout={2},passwd=***" -f $Ip,$Port,$Timeout)

$handle = [PullSDK]::Connect($connstr)
if ($handle -eq [IntPtr]::Zero) {
    $err = [PullSDK]::PullLastError()
    Write-Host ("[FALLO] Connect devolvio handle nulo. PullLastError = {0}" -f $err) -ForegroundColor Red
    Write-Host "Codigos comunes: -14 passwd incorrecta, -307 conexion rechazada, -203 init de comunicacion." -ForegroundColor Yellow
    return
}
Write-Host "[OK] Conectado al panel." -ForegroundColor Green
Write-Host ""

try {
    # ---------- 1) LECTURAS EN TIEMPO REAL (I1) ----------
    Write-Host "=== 1) LECTURAS EN TIEMPO REAL (GetRTLog) ===" -ForegroundColor Cyan
    Write-Host ("Escuchando {0}s. Pasa una tarjeta por el lector para generar eventos..." -f $CaptureSeconds)
    Write-Host "Formato crudo: time,pin,card,door,event_type,entry_exit,verify_mode"
    Write-Host ""

    $deadline = (Get-Date).AddSeconds($CaptureSeconds)
    $seen = 0
    while ((Get-Date) -lt $deadline) {
        $buf = New-Object byte[] 65536
        $rc = [PullSDK]::GetRTLog($handle, $buf, $buf.Length)
        if ($rc -lt 0) {
            Write-Host ("[GetRTLog error] {0}" -f $rc) -ForegroundColor Red
            break
        }
        $raw = ConvertTo-SdkString $buf
        foreach ($line in ($raw -split "`r`n")) {
            if (-not $line) { continue }
            $p = $line -split ","
            if ($p.Count -ge 7) {
                $etype = $p[4]
                if ($etype -eq '255') { continue }  # ruido de estado; descartar
                $desc = $EventTypes[[int]$etype]; if (-not $desc) { $desc = "(codigo $etype)" }
                $dir  = $Directions["$($p[5])"]; if (-not $dir) { $dir = $p[5] }
                $seen++
                Write-Host ("  CRUDO : {0}" -f $line) -ForegroundColor Gray
                Write-Host ("  legible: {0} | card={1} | door={2} | {3} | {4}" -f $p[0],$p[2],$p[3],$desc,$dir)
            }
        }
        Start-Sleep -Milliseconds 800
    }
    Write-Host ""
    Write-Host ("Eventos capturados (sin contar 255): {0}" -f $seen) -ForegroundColor Green
    Write-Host ""

    # ---------- 2) TARJETAS ACTIVAS (I2) ----------
    Write-Host "=== 2) TARJETAS (tabla 'user', GetDeviceData) ===" -ForegroundColor Cyan
    $ubuf = New-Object byte[] (4 * 1024 * 1024)   # hasta 4 MB
    $rc = [PullSDK]::GetDeviceData($handle, $ubuf, $ubuf.Length, "user", "*", "", "")
    if ($rc -lt 0) {
        Write-Host ("[GetDeviceData 'user' error] {0}" -f $rc) -ForegroundColor Red
    } else {
        $raw = ConvertTo-SdkString $ubuf
        $lines = $raw -split "`r`n" | Where-Object { $_ }
        if ($lines.Count -ge 1) {
            Write-Host ("ENCABEZADOS (crudo): {0}" -f $lines[0]) -ForegroundColor Yellow
            Write-Host ("Total de filas: {0}" -f ($lines.Count - 1))
            Write-Host ("Mostrando primeras {0}:" -f $MaxCards)
            $lines | Select-Object -Skip 1 -First $MaxCards | ForEach-Object {
                Write-Host ("  {0}" -f $_) -ForegroundColor Gray
            }
        }
    }
    Write-Host ""

    # ---------- 3) HISTORICOS (opcional) ----------
    if ($IncludeTransactions) {
        Write-Host "=== 3) HISTORICOS (tabla 'transaction', GetDeviceData) ===" -ForegroundColor Cyan
        Write-Host "Nota: puede ser un volumen grande; se muestran las primeras filas." -ForegroundColor Yellow
        $tbuf = New-Object byte[] (4 * 1024 * 1024)
        $rc = [PullSDK]::GetDeviceData($handle, $tbuf, $tbuf.Length, "transaction", "*", "", "")
        if ($rc -lt 0) {
            Write-Host ("[GetDeviceData 'transaction' error] {0}" -f $rc) -ForegroundColor Red
        } else {
            $raw = ConvertTo-SdkString $tbuf
            $lines = $raw -split "`r`n" | Where-Object { $_ }
            if ($lines.Count -ge 1) {
                Write-Host ("ENCABEZADOS (crudo): {0}" -f $lines[0]) -ForegroundColor Yellow
                Write-Host ("Total de filas: {0}" -f ($lines.Count - 1))
                $lines | Select-Object -Skip 1 -First $MaxTransactions | ForEach-Object {
                    Write-Host ("  {0}" -f $_) -ForegroundColor Gray
                }
            }
        }
        Write-Host ""
    }
}
finally {
    [PullSDK]::Disconnect($handle)
    Write-Host "[OK] Desconectado." -ForegroundColor Green
}
