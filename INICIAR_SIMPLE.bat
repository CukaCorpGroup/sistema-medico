@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   🏥 SISTEMA MÉDICO MARBELIZE (MODO EXCEL)              ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo ⏳ Iniciando servidores...
echo.

REM Iniciar Backend con Excel
start "Backend Excel - Puerto 3000" cmd /k "cd /d %~dp0backend && echo Iniciando Backend (Modo Excel)... && npm run dev"

echo ✅ Backend iniciando (Modo Excel)...
timeout /t 10 /nobreak >nul

REM Iniciar Frontend
start "Frontend - Puerto 4200" cmd /k "cd /d %~dp0frontend && echo Iniciando Frontend... && npm start"

echo ✅ Frontend iniciando...
echo.
echo ⏱️  Espera 30 segundos...
timeout /t 30 /nobreak >nul

echo.
echo 🌐 Abriendo navegador...
start http://localhost:4200

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  ✅ SISTEMA INICIADO                                     ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🔐 Credenciales:
echo    Usuario: admin
echo    Contraseña: admin123
echo.
echo 📁 Datos guardados en: backend\data\*.xlsx
echo.
echo ⚠️  NO CIERRES las ventanas de Backend y Frontend
echo.
pause





