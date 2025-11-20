@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   INICIAR SISTEMA MÉDICO MARBELIZE S.A.                 ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo [1/4] 📦 Verificando instalación de dependencias...
echo.

cd backend
if not exist node_modules (
    echo ⚠️  Instalando dependencias del BACKEND...
    call npm install
)
cd ..

cd frontend
if not exist node_modules (
    echo ⚠️  Instalando dependencias del FRONTEND...
    call npm install
)
cd ..

echo.
echo [2/4] 🗄️  IMPORTANTE: Configuración de Base de Datos
echo.
echo ⚠️  ANTES DE CONTINUAR, necesitas:
echo    1. Tener PostgreSQL instalado y corriendo
echo    2. Crear la base de datos: CREATE DATABASE sistema_medico;
echo    3. Editar backend\.env con tus credenciales
echo    4. Ejecutar: cd backend ^&^& npm run seed
echo.
echo ¿Ya completaste estos pasos? (S/N)
set /p DB_READY=

if /i "%DB_READY%" NEQ "S" (
    echo.
    echo ❌ Por favor completa la configuración de la base de datos primero.
    echo 📝 Revisa el archivo INICIAR.md para instrucciones detalladas
    pause
    exit
)

echo.
echo [3/4] 🚀 Iniciando BACKEND (Puerto 3000)...
echo.
start "Backend - Marbelize" cmd /k "cd backend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo [4/4] 🎨 Iniciando FRONTEND (Puerto 4200)...
echo.
start "Frontend - Marbelize" cmd /k "cd frontend && npm start"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   ✅ SISTEMA INICIADO CORRECTAMENTE                      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 📱 Espera 30 segundos y luego abre tu navegador en:
echo    http://localhost:4200
echo.
echo 🔐 Credenciales por defecto:
echo    Usuario: admin
echo    Contraseña: admin123
echo.
echo 💡 Se abrieron 2 ventanas:
echo    - Backend (Puerto 3000)
echo    - Frontend (Puerto 4200)
echo.
echo ⚠️  NO CIERRES estas ventanas mientras uses el sistema
echo.
timeout /t 30 /nobreak
start http://localhost:4200
pause






