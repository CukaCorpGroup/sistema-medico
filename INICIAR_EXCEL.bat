@echo off
chcp 65001 >nul
color 0A
cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║     🏥 SISTEMA MÉDICO MARBELIZE S.A. (EXCEL MODE)       ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 📁 Este sistema usa ARCHIVOS EXCEL como base de datos
echo 📂 Los archivos se guardarán en: backend\data\
echo.
echo ⏳ Iniciando sistema...
echo.

echo [1/2] Iniciando BACKEND (Puerto 3000) con Excel...
start "🔧 Backend - Excel Mode" cmd /k "cd backend && npm run dev"

timeout /t 10 /nobreak >nul

echo [2/2] Iniciando FRONTEND (Puerto 4200)...
start "🎨 Frontend - Marbelize" cmd /k "cd frontend && npm start"

echo.
echo ✅ Sistema iniciándose...
echo.
echo 📝 Información importante:
echo    - Backend: Puerto 3000 (Excel Mode)
echo    - Frontend: Puerto 4200
echo    - Base de datos: Archivos Excel en backend\data\
echo.
echo 📁 Archivos Excel que se crearán automáticamente:
echo    - usuarios.xlsx
echo    - pacientes.xlsx
echo    - cie10.xlsx
echo    - registros-medicos.xlsx
echo.
echo ⏱️  Espera 30 segundos para que compile...
echo.

timeout /t 30 /nobreak

echo ⏳ Abriendo navegador...
start http://localhost:4200

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  ✅ SISTEMA INICIADO (MODO EXCEL)                        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🔐 Credenciales de acceso:
echo    Usuario: admin
echo    Contraseña: admin123
echo.
echo 📊 Datos guardados en: backend\data\*.xlsx
echo    Puedes abrir y editar los archivos Excel directamente
echo.
echo ⚠️  NO CIERRES las ventanas de Backend y Frontend
echo.
pause





