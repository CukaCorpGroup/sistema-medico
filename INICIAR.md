# 🚀 Cómo Iniciar el Sistema Médico - Portal Marbelize S.A.

## ✅ El proyecto está creado en:
`C:\Users\proc-inge\Cursor\sistema-medico`

## 🚀 INICIO RÁPIDO (Recomendado)

### Opción 1: Usar Scripts Automáticos (MÁS FÁCIL)

**Paso 1:** Configurar Base de Datos
```cmd
CONFIGURAR_DB.bat
```

**Paso 2:** Iniciar Sistema
```cmd
INICIAR_RAPIDO.bat
```

¡Eso es todo! El script abrirá automáticamente el navegador en http://localhost:4200

---

## 🗄️ CONFIGURACIÓN MANUAL (Si prefieres)

### 1️⃣ Crear Base de Datos PostgreSQL

Abrir pgAdmin o terminal PostgreSQL y ejecutar:

```sql
CREATE DATABASE sistema_medico;
```

### 2️⃣ Configurar Variables de Entorno

El archivo `backend\.env` ya existe con estas configuraciones:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_medico
DB_USER=postgres
DB_PASSWORD=postgres
```

⚠️ **IMPORTANTE:** Si tu contraseña de PostgreSQL es diferente, edita `backend\.env`

### 3️⃣ Sembrar Base de Datos

```powershell
cd "C:\Users\proc-inge\Cursor\sistema-medico\backend"
npm run seed
```

Esto creará las tablas y datos iniciales (usuarios, códigos CIE-10, etc.)

## 📋 Pasos para Iniciar el Sistema

### 4️⃣ Abrir DOS VENTANAS de PowerShell

**Ventana 1 - Backend:**
```powershell
cd "C:\Users\proc-inge\Cursor\sistema-medico\backend"
npm run dev
```

**Ventana 2 - Frontend:**
```powershell
cd "C:\Users\proc-inge\Cursor\sistema-medico\frontend"
npm install
npm start
```

### 5️⃣ Esperar a que compilen

**Backend** mostrará:
```
╔══════════════════════════════════════════════╗
║  Portal de atención médica Marbelize S.A.   ║
║  ✅ Servidor iniciado exitosamente           ║
║                                              ║
║  🚀 Puerto: 3000                              
║  🔗 URL: http://localhost:3000               
║  📊 Health: http://localhost:3000/api/v1/health
║  🗄️  Base de datos: PostgreSQL               ║
║  🔗 Squarenet: Desconectado                  ║
╚══════════════════════════════════════════════╝
```

**Frontend** mostrará:
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

### 6️⃣ Abrir el Navegador

Ve a: **http://localhost:4200**

Verás la pantalla de login de Marbelize!

## 🔐 Credenciales de Acceso

Después de ejecutar `npm run seed`, usa estas credenciales:

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Doctor:**
- Usuario: `doctor1`
- Contraseña: `doctor123`

**Lector:**
- Usuario: `lector1`
- Contraseña: `lector123`

---

## 🎯 Sistema Completamente Implementado

✅ Backend API REST completo con Node.js + TypeScript + PostgreSQL
✅ Frontend Angular 17 con Standalone Components
✅ Base de datos con 8 modelos relacionados
✅ Integración con Squarenet (modo mock disponible)
✅ Catálogo de códigos CIE-10

### 📱 Módulos Disponibles:

1. **Registro de Atención Médica** - Con contadores automáticos (mensual por código, mensual total, anual total)
2. **Registro de Incidentes/Accidentes** - Con auto-población y generación de PDF
3. **Registro Antidopaje** - Con exportación a Excel
4. **Uso de Guantes** - Con exportación a Excel
5. **Certificados Médicos** - Con generación de PDF

### 🔗 Características Especiales:

- ✅ Auto-población de datos desde Squarenet (nómina activa)
- ✅ Búsqueda inteligente de códigos CIE-10
- ✅ Contadores automáticos de atenciones
- ✅ Exportación a Excel y PDF
- ✅ Validaciones según especificaciones (1500 caracteres diagnóstico/receta, 200 caracteres antidopaje, etc.)
- ✅ Seguridad con JWT y roles

---

## 📝 Documentación Completa

Ver archivo: **SETUP_COMPLETO.md** para documentación detallada incluyendo:
- Estructura completa del proyecto
- Todos los endpoints de API
- Reglas de negocio
- Configuración de Squarenet
- Troubleshooting

## 🆘 Ayuda Rápida

**Error de base de datos:**
- Verificar que PostgreSQL está corriendo
- Verificar credenciales en `backend\.env`
- Ejecutar `npm run seed` para crear tablas

**Puerto ocupado:**
```powershell
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000
# Matar el proceso
taskkill /PID [número] /F
```

---

¡El sistema está completamente implementado y listo para usar! 🎉

