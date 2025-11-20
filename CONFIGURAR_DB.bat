@echo off
chcp 65001 >nul
color 0B
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   CONFIGURAR BASE DE DATOS - MARBELIZE S.A.             ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo 🗄️  PASO 1: Crear Base de Datos
echo.
echo Abre pgAdmin o psql y ejecuta:
echo    CREATE DATABASE sistema_medico;
echo.
pause

echo.
echo 📝 PASO 2: Configurar Variables de Entorno
echo.
echo El archivo backend\.env ya existe con configuración por defecto.
echo.
echo ⚠️  SI USAS UNA CONTRASEÑA DIFERENTE PARA POSTGRES:
echo    1. Abre: backend\.env
echo    2. Cambia la línea: DB_PASSWORD=postgres
echo    3. Pon tu contraseña real
echo.
pause

echo.
echo 🌱 PASO 3: Sembrar Base de Datos (Crear tablas y datos)
echo.
cd backend
echo Ejecutando: npm run seed
echo.
call npm run seed

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ╔══════════════════════════════════════════════════════════╗
    echo ║   ✅ BASE DE DATOS CONFIGURADA EXITOSAMENTE             ║
    echo ╚══════════════════════════════════════════════════════════╝
    echo.
    echo 🎉 ¡Todo listo! Ahora puedes ejecutar INICIAR_RAPIDO.bat
) else (
    echo.
    echo ╔══════════════════════════════════════════════════════════╗
    echo ║   ❌ ERROR EN LA CONFIGURACIÓN                          ║
    echo ╚══════════════════════════════════════════════════════════╝
    echo.
    echo ⚠️  Posibles problemas:
    echo    1. PostgreSQL no está corriendo
    echo    2. La base de datos 'sistema_medico' no existe
    echo    3. Contraseña incorrecta en backend\.env
    echo    4. Usuario de PostgreSQL incorrecto
    echo.
    echo 💡 Soluciones:
    echo    1. Verifica que PostgreSQL esté corriendo
    echo    2. Crea la base de datos: CREATE DATABASE sistema_medico;
    echo    3. Revisa backend\.env y ajusta las credenciales
)

cd ..
echo.
pause






