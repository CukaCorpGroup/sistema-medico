# Sistema Médico - Portal de Atención Médica Marbelize S.A.

Sistema integral de gestión médica ocupacional desarrollado con Node.js, Express, TypeScript, PostgreSQL y Angular 17.

## 🚀 INICIO SÚPER RÁPIDO

### ⚡ MODO EXCEL (Recomendado - SIN PostgreSQL)

**¿No quieres instalar PostgreSQL? Usa archivos Excel como base de datos:**

```
Doble clic en: INICIAR_EXCEL.bat
```

✅ **Ventajas del Modo Excel:**
- No necesitas instalar PostgreSQL
- Los datos se guardan en archivos .xlsx (carpeta `backend/data/`)
- Puedes editar los archivos Excel directamente
- Ideal para demos, pruebas y equipos pequeños

📖 **[Ver documentación completa del Modo Excel →](README_EXCEL.md)**

---

### 💾 MODO PostgreSQL (Producción)

**Si prefieres usar PostgreSQL como base de datos tradicional:**

**Paso 1:** Configura la base de datos (solo la primera vez)
```
Doble clic en: CONFIGURAR_DB.bat
```

**Paso 2:** Inicia el sistema completo
```
Doble clic en: INICIAR_TODO.bat
```

**Paso 3:** Espera 30 segundos y ¡listo! Se abrirá automáticamente en tu navegador.

---

### 📋 Opción 2: Inicio Manual

**Requisitos Previos:**
- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm >= 9.0.0

**1. Configurar Base de Datos (solo primera vez):**
```sql
CREATE DATABASE sistema_medico;
```
```bash
cd backend
npm run seed
```

**2. Iniciar Backend:**
```bash
cd backend
npm run dev
```

**3. Iniciar Frontend (en otra ventana):**
```bash
cd frontend
npm start
```

**4. Acceder:**
- URL: http://localhost:4200
- Usuario: `admin`
- Contraseña: `admin123`

## 📋 Características

- ✅ Autenticación JWT con roles
- ✅ Registro de Atención Médica
- ✅ Registro de Incidentes/Accidentes
- ✅ Registro Antidopaje
- ✅ Generación de Certificados Médicos
- ✅ Exportación a PDF y Excel
- ✅ Diseño responsive adaptado a mockups Marbelize

## 🗄️ Base de Datos

```sql
CREATE DATABASE sistema_medico;
```

## 📱 Módulos

- **Login**: Pantalla de acceso con diseño corporativo
- **Dashboard**: Panel principal con estadísticas
- **Registro Médico**: Gestión de consultas y CIE-10
- **Incidentes**: Documentación de accidentes laborales
- **Antidopaje**: Control de pruebas del personal
- **Certificados**: Generación de documentos oficiales

## 🎨 Tecnologías

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL + Sequelize ORM
- JWT + bcrypt
- Winston (logging)
- PDFKit + ExcelJS

**Frontend:**
- Angular 17 (Standalone Components)
- Bootstrap 5 + SCSS
- Font Awesome
- ngx-toastr

## 📞 Soporte

Sistema desarrollado para Marbelize S.A. © 2025

