@echo off
setlocal
title Reparar Agente ZK - Interlomas
color 0B

set "PS32=C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"
set "SCRIPT=C:\agente-zk\zk-pull-upload.ps1"
set "TASK=ZK-Agente-Interlomas"

echo ==================================================
echo    REPARAR / FORZAR AGENTE ZKAccess (Interlomas)
echo ==================================================
echo.

REM --- Verificaciones basicas ---
if not exist "%SCRIPT%" (
  echo [ERROR] No existe %SCRIPT%
  echo         Revisa la carpeta C:\agente-zk
  goto :fin
)
if not exist "C:\agente-zk\token.txt" (
  if "%ZK_AGENT_TOKEN%"=="" (
    echo [AVISO] No hay token: falta C:\agente-zk\token.txt y ZK_AGENT_TOKEN vacio.
    echo         El servidor respondera 401 hasta que coloques el token.
    echo.
  )
)

REM --- 1) Ejecutar el agente AHORA (32-bit por la DLL) ---
echo [1/2] Ejecutando el agente ahora...
echo --------------------------------------------------
"%PS32%" -ExecutionPolicy Bypass -File "%SCRIPT%"
echo --------------------------------------------------
echo.

REM --- 2) Reasegurar la Tarea Programada (cada 1 min) ---
echo [2/2] Verificando la tarea programada...
schtasks /Query /TN "%TASK%" >nul 2>&1
if errorlevel 1 (
  echo    No existia. Creandola cada 1 minuto...
  schtasks /Create /TN "%TASK%" /SC MINUTE /MO 1 /F /RL LIMITED /TR "\"%PS32%\" -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%SCRIPT%\""
) else (
  echo    La tarea existe. Reactivando por si estaba detenida...
  schtasks /Change /TN "%TASK%" /ENABLE >nul 2>&1
  echo    OK.
)

:fin
echo.
echo ==================================================
echo    Listo. Revisa arriba "Subido OK" o el error.
echo ==================================================
echo.
pause
endlocal
