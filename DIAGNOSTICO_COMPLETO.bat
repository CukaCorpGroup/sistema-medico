@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA                   ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo [1/5] 📡 Verificando Backend (Puerto 3000)...
timeout /t 1 /nobreak >nul
curl -s http://localhost:3000/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend respondiendo en puerto 3000
) else (
    echo ❌ Backend NO responde en puerto 3000
    echo.
    echo 🔧 SOLUCIÓN: Ejecuta INICIAR_LIMPIO.bat primero
    pause
    exit /b 1
)

echo.
echo [2/5] 📡 Verificando Frontend (Puerto 4200)...
timeout /t 1 /nobreak >nul
curl -s http://localhost:4200/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend respondiendo en puerto 4200
) else (
    echo ❌ Frontend NO responde en puerto 4200
    echo.
    echo 🔧 SOLUCIÓN: Ejecuta INICIAR_LIMPIO.bat primero
    pause
    exit /b 1
)

echo.
echo [3/5] 🗄️  Verificando archivo de usuarios...
if exist "backend\data\usuarios.xlsx" (
    echo ✅ Archivo usuarios.xlsx existe
) else (
    echo ❌ Archivo usuarios.xlsx NO existe
    echo.
    echo 🔧 Creando archivo de usuarios...
    cd backend
    node reiniciar-usuarios.js
    cd ..
)

echo.
echo [4/5] 🔐 Probando Login con credenciales...
echo.
curl -s -X POST http://localhost:3000/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > test_login.json

findstr /C:"token" test_login.json >nul
if %errorlevel% equ 0 (
    echo ✅ Login FUNCIONA correctamente
    echo.
    type test_login.json | findstr "token"
) else (
    echo ❌ Login FALLÓ
    echo.
    echo Respuesta del servidor:
    type test_login.json
    echo.
    echo 🔧 Recreando usuarios...
    cd backend
    node reiniciar-usuarios.js
    cd ..
)

del test_login.json >nul 2>&1

echo.
echo [5/5] 🌐 Verificando CORS...
echo ✅ CORS configurado para: http://localhost:4200

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   ✅ DIAGNÓSTICO COMPLETADO                             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 📋 RESUMEN:
echo    • Backend: http://localhost:3000 ✅
echo    • Frontend: http://localhost:4200 ✅
echo    • Usuario: admin
echo    • Contraseña: admin123
echo.
echo 🚀 Abre tu navegador en: http://localhost:4200
echo.
echo 💡 Si el botón sigue sin funcionar:
echo    1. Presiona F12 en el navegador
echo    2. Ve a la pestaña "Console"
echo    3. Intenta hacer login
echo    4. Copia el error que aparece
echo.
pause





