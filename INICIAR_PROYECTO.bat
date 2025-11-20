@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   🏥 SISTEMA MÉDICO MARBELIZE - INICIO COMPLETO          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Detener procesos anteriores
echo [1/6] 🛑 Deteniendo procesos anteriores...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Backend*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Frontend*" 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Procesos detenidos
echo.

REM Verificar directorios
echo [2/6] 📁 Verificando estructura de directorios...
if not exist "backend\data" mkdir "backend\data"
if not exist "backend\logs" mkdir "backend\logs"
echo ✅ Directorios verificados
echo.

REM Recrear usuarios si es necesario
echo [3/6] 👤 Verificando archivo de usuarios...
cd backend
if not exist "data\usuarios.xlsx" (
    echo    Creando archivo de usuarios...
    node reiniciar-usuarios.js
) else (
    echo    Archivo de usuarios existe
)
cd ..
echo ✅ Usuarios verificados
echo.

REM Verificar dependencias del backend
echo [4/6] 📦 Verificando dependencias del Backend...
cd backend
if not exist "node_modules" (
    echo    Instalando dependencias del backend...
    call npm install
)
cd ..
echo ✅ Backend listo
echo.

REM Verificar dependencias del frontend
echo [5/6] 📦 Verificando dependencias del Frontend...
cd frontend
if not exist "node_modules" (
    echo    Instalando dependencias del frontend...
    call npm install
)
cd ..
echo ✅ Frontend listo
echo.

REM Iniciar Backend
echo [6/6] 🚀 Iniciando servidores...
echo.
echo    Iniciando Backend (Puerto 3000)...
start "Backend - Sistema Médico" cmd /k "cd /d %CD%\backend && echo ═══════════════════════════════════ && echo    BACKEND - SISTEMA MEDICO && echo ═══════════════════════════════════ && echo. && npm run dev"
timeout /t 5 /nobreak >nul

echo    Iniciando Frontend (Puerto 4200)...
start "Frontend - Sistema Médico" cmd /k "cd /d %CD%\frontend && echo ═══════════════════════════════════ && echo    FRONTEND - SISTEMA MEDICO && echo ═══════════════════════════════════ && echo. && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ⏱️  Esperando compilación inicial (30 segundos)...
timeout /t 30 /nobreak >nul

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   ✅ SISTEMA INICIADO CORRECTAMENTE                      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🔐 CREDENCIALES DE ACCESO:
echo    ┌─────────────────────────────────────┐
echo    │  Usuario: admin                     │
echo    │  Contraseña: admin123               │
echo    └─────────────────────────────────────┘
echo.
echo 🌐 Abriendo navegador...
start http://localhost:4200
echo.
echo 📋 INFORMACIÓN IMPORTANTE:
echo    • Se abrieron 2 ventanas de comandos (Backend y Frontend)
echo    • NO cierres esas ventanas mientras uses el sistema
echo    • El backend está en: http://localhost:3000
echo    • El frontend está en: http://localhost:4200
echo    • Los datos se guardan en: backend\data\*.xlsx
echo.
echo ✅ ¡Sistema listo para usar!
echo.
pause




