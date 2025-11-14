# Sistema Médico - Backend API

Backend del Portal de Atención Médica Marbelize S.A. desarrollado con Node.js, Express, TypeScript y PostgreSQL.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm >= 9.0.0

### Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar base de datos:**
```sql
CREATE DATABASE sistema_medico;
```

3. **Configurar variables de entorno:**
Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Base de datos PostgreSQL (opcional si usas Excel)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_medico
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT Secret
JWT_SECRET=sistema-medico-secret-key

# Configuración SMTP para envío de correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion

# Squarenet (opcional)
SQUARENET_ENABLED=false
SQUARENET_API_URL=
SQUARENET_API_KEY=
```

**Nota importante para Gmail:**
Si usas Gmail, necesitas generar una "Contraseña de aplicación":
1. Ve a tu cuenta de Google → Seguridad
2. Activa la verificación en 2 pasos
3. Genera una "Contraseña de aplicación"
4. Usa esa contraseña en `SMTP_PASS`

4. **Sembrar base de datos:**
```bash
npm run seed
```

5. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📋 Credenciales por Defecto

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Doctor:**
- Usuario: `doctor1`
- Contraseña: `doctor123`

**Lector:**
- Usuario: `lector1`
- Contraseña: `lector123`

## 🗄️ Estructura de la Base de Datos

### Modelos Principales

- **Users**: Usuarios del sistema (admin, doctor, reader)
- **Patients**: Pacientes/Empleados
- **CIE10**: Catálogo de códigos CIE-10
- **MedicalRecords**: Registros de atención médica
- **Incidents**: Registro de incidentes/accidentes
- **Antidoping**: Registros de pruebas antidopaje
- **Gloves**: Registros de uso de guantes
- **Certificates**: Certificados médicos generados

## 📡 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/change-password` - Cambiar contraseña
- `GET /api/v1/auth/me` - Obtener usuario actual

### Pacientes
- `GET /api/v1/patients/search` - Buscar paciente por cédula
- `GET /api/v1/patients` - Listar pacientes
- `POST /api/v1/patients` - Crear paciente
- `PUT /api/v1/patients/:id` - Actualizar paciente

### Códigos CIE-10
- `GET /api/v1/cie10/search` - Buscar códigos CIE-10
- `GET /api/v1/cie10` - Listar códigos
- `POST /api/v1/cie10` - Crear código (admin)
- `POST /api/v1/cie10/bulk` - Crear múltiples códigos (admin)

### Registros Médicos
- `POST /api/v1/medical-records` - Crear registro
- `GET /api/v1/medical-records` - Listar registros
- `GET /api/v1/medical-records/:id` - Obtener registro
- `PUT /api/v1/medical-records/:id` - Actualizar registro
- `DELETE /api/v1/medical-records/:id` - Eliminar registro
- `GET /api/v1/medical-records/export/excel` - Exportar a Excel

### Incidentes
- `POST /api/v1/incidents` - Crear incidente
- `GET /api/v1/incidents` - Listar incidentes
- `GET /api/v1/incidents/:id` - Obtener incidente
- `GET /api/v1/incidents/:id/pdf` - Generar PDF
- `PUT /api/v1/incidents/:id` - Actualizar incidente
- `GET /api/v1/incidents/export/excel` - Exportar a Excel

### Antidopaje
- `POST /api/v1/antidoping` - Crear registro
- `GET /api/v1/antidoping` - Listar registros
- `GET /api/v1/antidoping/:id` - Obtener registro
- `PUT /api/v1/antidoping/:id` - Actualizar registro
- `GET /api/v1/antidoping/export/excel` - Exportar a Excel

### Uso de Guantes
- `POST /api/v1/gloves` - Crear registro
- `GET /api/v1/gloves` - Listar registros
- `GET /api/v1/gloves/:id` - Obtener registro
- `PUT /api/v1/gloves/:id` - Actualizar registro
- `GET /api/v1/gloves/export/excel` - Exportar a Excel

### Certificados Médicos
- `POST /api/v1/certificates` - Crear certificado
- `GET /api/v1/certificates` - Listar certificados
- `GET /api/v1/certificates/:id` - Obtener certificado
- `GET /api/v1/certificates/:id/pdf` - Generar PDF
- `PUT /api/v1/certificates/:id` - Actualizar certificado

## 🔗 Integración con Squarenet

El sistema está preparado para integrarse con el sistema de nómina Squarenet para obtener automáticamente los datos de los empleados.

Para habilitar la integración:

```env
SQUARENET_ENABLED=true
SQUARENET_API_URL=http://tu-servidor-squarenet/api
SQUARENET_API_KEY=tu-api-key
```

Si Squarenet no está disponible, el sistema funciona en modo mock para desarrollo.

## 🛠️ Scripts Disponibles

- `npm run dev` - Iniciar servidor en modo desarrollo
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Iniciar servidor en producción
- `npm run seed` - Sembrar base de datos con datos iniciales

## 📝 Características

- ✅ Autenticación JWT con roles (admin, doctor, reader)
- ✅ Integración con Squarenet (nómina activa)
- ✅ Catálogo de códigos CIE-10
- ✅ Registro de atención médica con contadores automáticos
- ✅ Registro de incidentes/accidentes con auto-población de datos
- ✅ Registro de pruebas antidopaje
- ✅ Registro de uso de guantes
- ✅ Generación de certificados médicos
- ✅ Exportación a Excel y PDF
- ✅ Logging con Winston
- ✅ Rate limiting y seguridad con Helmet
- ✅ Validación de datos con Joi
- ✅ Compresión de respuestas

## 🔒 Seguridad

- Autenticación JWT
- Hasheo de contraseñas con bcrypt
- Helmet para headers de seguridad
- Rate limiting para prevenir ataques
- Validación de entrada de datos
- CORS configurado

## 📞 Soporte

Sistema desarrollado para Marbelize S.A. © 2025



