@echo off
chcp 65001 >nul
color 0C
cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   🛑 DETENER TODOS LOS SERVIDORES                        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Matando procesos en puerto 3000 y 4200...
echo.

REM Matar proceso en puerto 3000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do (
    echo Matando proceso en puerto 3000 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Matar proceso en puerto 4200 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4200"') do (
    echo Matando proceso en puerto 4200 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Matar todos los procesos de node y ng
taskkill /F /IM node.exe 2>nul
taskkill /F /IM ng.exe 2>nul

echo.
echo ✅ Todos los procesos detenidos
echo.
echo Ahora puedes ejecutar INICIAR_SIMPLE.bat
echo.
pause





