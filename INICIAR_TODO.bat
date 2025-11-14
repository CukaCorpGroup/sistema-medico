@echo off
chcp 65001 >nul
color 0A
cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║     🏥 SISTEMA MÉDICO MARBELIZE S.A.                    ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🚀 Iniciando sistema completo...
echo.
echo ⏳ Paso 1/3: Iniciando BACKEND (Puerto 3000)...
start "🔧 Backend - Marbelize" cmd /k "cd backend && npm run dev"

timeout /t 8 /nobreak >nul

echo ⏳ Paso 2/3: Iniciando FRONTEND (Puerto 4200)...
start "🎨 Frontend - Marbelize" cmd /k "cd frontend && npm start"

echo.
echo ✅ Sistema iniciándose...
echo.
echo 📝 Información importante:
echo    - Se abrieron 2 ventanas de comandos
echo    - Backend: Puerto 3000
echo    - Frontend: Puerto 4200
echo.
echo ⏱️  Espera 30 segundos para que compile...
echo.
echo 🌐 Abriendo navegador en http://localhost:4200
echo.

timeout /t 30 /nobreak

echo ⏳ Paso 3/3: Abriendo navegador...
start http://localhost:4200

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  ✅ SISTEMA INICIADO                                     ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🔐 Credenciales de acceso:
echo    Usuario: admin
echo    Contraseña: admin123
echo.
echo ⚠️  NO CIERRES las ventanas de Backend y Frontend
echo    hasta que termines de usar el sistema
echo.
echo 💡 Puedes cerrar ESTA ventana si quieres
echo.
pause





