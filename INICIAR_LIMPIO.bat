@echo off
chcp 65001 >nul
color 0A
cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   🏥 INICIO LIMPIO - SISTEMA MÉDICO MARBELIZE           ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo [1/4] 🛑 Deteniendo procesos anteriores...
echo.

REM Matar todos los procesos de node y Angular
taskkill /F /IM node.exe 2>nul
taskkill /F /IM ng.exe 2>nul

REM Matar procesos en puertos específicos
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do (
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4200"') do (
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak >nul
echo ✅ Procesos anteriores detenidos
echo.

echo [2/4] 🚀 Iniciando Backend (Modo Excel - Puerto 3000)...
echo.
start "🔧 Backend Excel - Puerto 3000" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 12 /nobreak >nul
echo ✅ Backend iniciando...
echo.

echo [3/4] 🎨 Iniciando Frontend (Angular - Puerto 4200)...
echo.
start "🎨 Frontend Angular - Puerto 4200" cmd /k "cd /d %~dp0frontend && npm start"

echo ✅ Frontend iniciando...
echo.

echo [4/4] ⏱️  Esperando a que compile (30 segundos)...
echo.
timeout /t 30 /nobreak

echo 🌐 Abriendo navegador...
start http://localhost:4200

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  ✅ SISTEMA INICIADO CORRECTAMENTE                       ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🔐 CREDENCIALES:
echo    Usuario: admin
echo    Contraseña: admin123
echo.
echo 📊 ESTADO:
echo    ✅ Backend: http://localhost:3000 (Modo Excel)
echo    ✅ Frontend: http://localhost:4200
echo    ✅ Datos en: backend\data\*.xlsx
echo.
echo 💡 IMPORTANTE:
echo    - Se abrieron 2 ventanas de comandos
echo    - NO las cierres mientras uses el sistema
echo    - Todos los datos se guardan automáticamente en Excel
echo.
echo 📋 MÓDULOS DISPONIBLES:
echo    1. Registro Médico
echo    2. Incidentes/Accidentes
echo    3. Antidopaje
echo    4. Certificados Médicos
echo.
pause





