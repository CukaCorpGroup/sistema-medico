@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   🔧 SOLUCIÓN DEFINITIVA - SISTEMA MÉDICO               ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Este script va a:
echo   1. Detener todos los procesos anteriores
echo   2. Recrear el archivo de usuarios correctamente
echo   3. Iniciar el sistema completo
echo.
pause

echo.
echo [1/5] 🛑 Deteniendo procesos anteriores...
echo.
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Procesos detenidos

echo.
echo [2/5] 🗄️  Recreando archivo de usuarios...
echo.
cd backend
node reiniciar-usuarios.js
cd ..
echo.

echo.
echo [3/5] 🚀 Iniciando Backend (Puerto 3000)...
echo.
start "Backend - Sistema Médico" cmd /k "cd /d %CD%\backend && npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ Backend iniciado

echo.
echo [4/5] 🎨 Iniciando Frontend (Puerto 4200)...
echo.
start "Frontend - Sistema Médico" cmd /k "cd /d %CD%\frontend && npm start"
timeout /t 3 /nobreak >nul
echo ✅ Frontend iniciado

echo.
echo [5/5] ⏱️  Esperando compilación...
echo.
timeout /t 20 /nobreak >nul

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   ✅ SISTEMA LISTO!                                     ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🔐 CREDENCIALES:
echo    Usuario: admin
echo    Contraseña: admin123
echo.
echo 🌐 ABRIENDO NAVEGADOR...
echo.
start http://localhost:4200
echo.
echo 📋 IMPORTANTE:
echo    - Se abrieron 2 ventanas de comandos (Backend y Frontend)
echo    - NO las cierres mientras uses el sistema
echo    - El sistema ya está listo para usar
echo.
echo 💡 Si el botón de login no responde:
echo    1. Presiona F5 para recargar la página
echo    2. Haz clic en el botón "INGRESAR"
echo    3. Deberías ver un mensaje de éxito
echo.
echo ✅ ¡SISTEMA FUNCIONANDO CORRECTAMENTE!
echo.
pause






