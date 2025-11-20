# 📋 GUÍA DE CONFIGURACIÓN COMPLETA - Sistema Médico Marbelize S.A.

## 🎯 Sistema Implementado

Se ha adaptado completamente el sistema según las especificaciones funcionales proporcionadas en las imágenes, incluyendo:

### ✅ Características Implementadas

1. **Sistema de Autenticación**
   - Login con validación de credenciales (usuarios alfanuméricos, contraseñas alfanuméricas)
   - Gestión de roles: Administrador, Doctor, Lector
   - Cambio de contraseña obligatorio en primer acceso
   - Tokens JWT para seguridad

2. **Integración con Squarenet**
   - Búsqueda automática de empleados por cédula
   - Auto-población de datos desde nómina activa
   - Modo mock para desarrollo/testing

3. **Catálogo CIE-10**
   - Base de datos completa de códigos CIE-10
   - Búsqueda inteligente por código o descripción
   - Auto-completado en formularios

4. **Módulo de Registro de Atención Médica**
   - Todos los campos especificados en mockups
   - Búsqueda de paciente por identificación con ícono de lupa
   - Auto-población desde Squarenet
   - Campos de fecha y hora
   - Tipo de consulta configurable
   - Búsqueda de CIE-10 con auto-completado
   - Campo Evolución (diagnóstico) de 1500 caracteres
   - Campo Receta de 1500 caracteres
   - **Contadores automáticos:**
     - Mensual por código CIE-10
     - Mensual total
     - Anual total
   - Botones: GUARDAR ATENCIÓN MÉDICA, BORRAR DATOS
   - Generación de certificado médico opcional
   - Exportación a Excel por rango de fechas

5. **Módulo de Registro de Incidentes/Accidentes**
   - Auto-población completa desde registro de atención médica
   - Campos: Fecha, Médico, Identificación, Nombres y apellidos, Puesto de trabajo, Área de trabajo, Empresa, Dirección, Teléfono
   - CIE-10, Descripción y Causas auto-poblados
   - Código Secundario y Descripción editables
   - Evolución (1500 caracteres)
   - Receta (1500 caracteres)
   - Días de reposo (máx 2 caracteres)
   - Botones: GUARDAR PDF, GUARDAR ATENCIÓN
   - Exportación a Excel por rango de fechas

6. **Módulo de Registro Antidopaje**
   - Fecha seleccionable desde calendario
   - Identificación con búsqueda y auto-población desde Squarenet
   - Campos auto-poblados: Nombres y apellidos, Puesto de trabajo, Área de trabajo
   - Campos editables (200 caracteres): Verificación, Observaciones, Evolución
   - Botón GUARDAR
   - Exportación a Excel por rango de fechas

7. **Módulo de Uso de Guantes**
   - Registro con fecha inicio y fecha fin
   - Búsqueda por identificación con auto-población
   - Datos del empleado desde Squarenet
   - Botones para guardar
   - Exportación a Excel por rango de fechas

8. **Módulo de Generación de Certificados Médicos**
   - Auto-población desde registro de atención médica
   - Campos: Nombres y apellidos, Puesto de trabajo, Área de trabajo, Teléfono, Empresa, Dirección
   - CIE-10 y Descripción desde atención
   - Registro de certificado médico con Fecha Desde y Fecha Hasta
   - Cálculo automático de días válidos
   - Institución que emite (lista desplegable)
   - Médico que emite (editable)
   - Especialidad B, Servicio C, Documento, Médico D (listas desplegables)
   - Observaciones (250 caracteres alfanuméricos)
   - Botón GUARDAR DATOS CERTIFICADO
   - Generación de PDF para imprimir

## 🗄️ Base de Datos

### Modelos Implementados

1. **users** - Usuarios del sistema
2. **patients** - Pacientes/Empleados
3. **cie10_codes** - Catálogo de códigos CIE-10
4. **medical_records** - Registros de atención médica
5. **incidents** - Incidentes/Accidentes
6. **antidoping_records** - Registros antidopaje
7. **gloves_records** - Registro de uso de guantes
8. **certificates** - Certificados médicos

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### Paso 1: Configurar Base de Datos PostgreSQL

```sql
-- Crear base de datos
CREATE DATABASE sistema_medico;

-- Crear usuario (opcional)
CREATE USER sistema_medico_user WITH ENCRYPTED PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE sistema_medico TO sistema_medico_user;
```

### Paso 2: Configurar Backend

```powershell
# Navegar a carpeta backend
cd C:\Users\proc-inge\Cursor\sistema-medico\backend

# Instalar dependencias (si no están instaladas)
npm install

# Configurar variables de entorno
# Editar el archivo backend/.env con tus credenciales:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sistema_medico
# DB_USER=postgres
# DB_PASSWORD=tu_password

# Sembrar base de datos con datos iniciales
npm run seed

# Iniciar servidor
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### Paso 3: Configurar Frontend

```powershell
# Abrir NUEVA ventana de PowerShell
# Navegar a carpeta frontend
cd C:\Users\proc-inge\Cursor\sistema-medico\frontend

# Instalar dependencias (si no están instaladas)
npm install

# Iniciar aplicación
npm start
```

El frontend estará disponible en `http://localhost:4200`

## 🔐 Credenciales de Acceso

Después de ejecutar `npm run seed`, podrás acceder con:

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Doctor:**
- Usuario: `doctor1`
- Contraseña: `doctor123`

**Lector:**
- Usuario: `lector1`
- Contraseña: `lector123`

## 📱 Módulos del Sistema

### Pantalla Principal

Después del login, verás el **Dashboard** con acceso a:

1. 📋 **Registro de Atención Médica** - Consultas médicas completas
2. 🚨 **Registro de Incidentes/Accidentes** - Documentación de incidentes
3. 🧪 **Registro Antidopaje** - Control de pruebas
4. 🧤 **Uso de Guantes** - Registro de equipamiento
5. 📄 **Certificados Médicos** - Generación de documentos

## 🔗 Integración con Squarenet

### Configuración

Para habilitar la integración con Squarenet, editar `backend/.env`:

```env
SQUARENET_ENABLED=true
SQUARENET_API_URL=http://tu-servidor-squarenet/api
SQUARENET_API_KEY=tu-api-key-aqui
```

### Funcionamiento

- El sistema busca automáticamente empleados por cédula en Squarenet
- Si encuentra al empleado, auto-completa todos sus datos
- Si no está habilitado o falla, usa datos mock para desarrollo
- Los datos se guardan localmente en la primera búsqueda

## 📊 Características Especiales

### Contadores Automáticos

El sistema calcula automáticamente:
- **Mensual por código**: Atenciones del paciente con el mismo CIE-10 en el mes
- **Mensual total**: Total de atenciones del paciente en el mes
- **Anual total**: Total de atenciones del paciente en el año

### Auto-Población de Datos

Todos los módulos están interconectados:
- Los incidentes se auto-pueblan desde atención médica
- Los certificados heredan datos de atención médica
- Antidopaje y guantes buscan en Squarenet automáticamente

### Exportaciones

- **Excel**: Todos los módulos permiten exportar por rango de fechas
- **PDF**: Incidentes y certificados generan PDFs imprimibles

## 🛠️ Estructura del Proyecto

```
sistema-medico/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores de API
│   │   ├── models/            # Modelos de base de datos
│   │   ├── routes/            # Rutas de API
│   │   ├── middleware/        # Middleware (auth, validation, errors)
│   │   ├── utils/             # Utilidades (logger, squarenet)
│   │   ├── config/            # Configuración (database)
│   │   └── app.ts             # Aplicación principal
│   ├── .env                   # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/      # Servicios de API
│   │   │   │   ├── guards/        # Guards de rutas
│   │   │   │   ├── interceptors/  # Interceptores HTTP
│   │   │   │   └── models/        # Interfaces TypeScript
│   │   │   ├── pages/
│   │   │   │   ├── login/         # Pantalla de login
│   │   │   │   ├── dashboard/     # Dashboard principal
│   │   │   │   ├── medical-records/   # Atención médica
│   │   │   │   ├── incidents/         # Incidentes
│   │   │   │   ├── antidoping/        # Antidopaje
│   │   │   │   └── certificates/      # Certificados
│   │   │   └── shared/
│   │   │       └── components/    # Componentes reutilizables
│   │   └── environments/
│   └── package.json
│
└── SETUP_COMPLETO.md              # Este archivo
```

## 📝 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/change-password` - Cambiar contraseña
- `GET /api/v1/auth/me` - Usuario actual

### Pacientes
- `GET /api/v1/patients/search?identification=xxx` - Buscar por cédula
- `GET /api/v1/patients` - Listar
- `POST /api/v1/patients` - Crear
- `PUT /api/v1/patients/:id` - Actualizar

### CIE-10
- `GET /api/v1/cie10/search?query=xxx` - Buscar códigos
- `GET /api/v1/cie10/code/:code` - Obtener por código

### Atención Médica
- `POST /api/v1/medical-records` - Crear registro
- `GET /api/v1/medical-records` - Listar
- `GET /api/v1/medical-records/:id` - Obtener
- `PUT /api/v1/medical-records/:id` - Actualizar
- `DELETE /api/v1/medical-records/:id` - Eliminar
- `GET /api/v1/medical-records/export/excel` - Exportar

### Incidentes
- `POST /api/v1/incidents` - Crear
- `GET /api/v1/incidents` - Listar
- `GET /api/v1/incidents/:id/pdf` - Generar PDF
- `GET /api/v1/incidents/export/excel` - Exportar

### Antidopaje
- `POST /api/v1/antidoping` - Crear
- `GET /api/v1/antidoping` - Listar
- `GET /api/v1/antidoping/export/excel` - Exportar

### Uso de Guantes
- `POST /api/v1/gloves` - Crear
- `GET /api/v1/gloves` - Listar
- `GET /api/v1/gloves/export/excel` - Exportar

### Certificados
- `POST /api/v1/certificates` - Crear
- `GET /api/v1/certificates` - Listar
- `GET /api/v1/certificates/:id/pdf` - Generar PDF

## ⚙️ Reglas de Negocio Implementadas

### Validaciones

1. **Login**: Usuario alfanumérico, contraseña alfanumérica
2. **Evolución/Diagnóstico**: Máximo 1500 caracteres
3. **Receta**: Máximo 1500 caracteres
4. **Días de reposo**: Máximo 2 caracteres numéricos (0-99)
5. **Campos de antidopaje**: Máximo 200 caracteres cada uno
6. **Observaciones certificado**: Máximo 250 caracteres alfanuméricos

### Permisos por Rol

- **Admin**: Acceso total, puede gestionar códigos CIE-10
- **Doctor**: Puede crear y editar registros médicos
- **Lector**: Solo lectura de registros

## 🎨 Branding Marbelize

El sistema muestra:
- Logo: "Portal de atención médica Marbelize S.A."
- Diseño según mockups proporcionados
- Colores corporativos
- UI responsiva y moderna

## 🔧 Troubleshooting

### Error de conexión a base de datos
```
Verificar que PostgreSQL está corriendo
Verificar credenciales en backend/.env
Verificar que la base de datos existe
```

### Error "Cannot find module"
```powershell
cd backend
npm install

cd ../frontend
npm install
```

### Puerto ya en uso
```powershell
# Cambiar puerto en backend/.env
PORT=3001

# O matar proceso en puerto 3000
netstat -ano | findstr :3000
taskkill /PID [número] /F
```

## 📞 Soporte

Sistema desarrollado para **Marbelize S.A.** © 2025

Para soporte técnico, contactar al equipo de desarrollo.

---

## ✅ Checklist de Verificación

Antes de usar el sistema, verificar:

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `sistema_medico` creada
- [ ] Dependencias del backend instaladas (`npm install`)
- [ ] Dependencias del frontend instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Base de datos sembrada (`npm run seed`)
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 4200
- [ ] Puede acceder a http://localhost:4200
- [ ] Puede hacer login con credenciales por defecto

¡El sistema está listo para usar! 🎉






