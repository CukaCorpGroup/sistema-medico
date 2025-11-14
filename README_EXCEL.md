# 📊 Sistema Médico Marbelize - MODO EXCEL

## 🎉 ¡SIN BASE DE DATOS PostgreSQL!

Este sistema está configurado para usar **archivos Excel** como base de datos. No necesitas instalar ni configurar PostgreSQL.

## 🚀 INICIO SÚPER RÁPIDO (2 Pasos)

### ⚡ Opción 1: Script Automático (LA MÁS FÁCIL)

```
Doble clic en: INICIAR_EXCEL.bat
```

¡Eso es TODO! El script:
- ✅ Inicia el backend en modo Excel
- ✅ Inicia el frontend
- ✅ Crea automáticamente los archivos Excel
- ✅ Abre tu navegador

**Espera 30 segundos y ¡listo!** 🎉

---

### 📋 Opción 2: Inicio Manual

**1. Iniciar Backend (en PowerShell):**
```powershell
cd backend
npm run dev
```

**2. Iniciar Frontend (en otra ventana de PowerShell):**
```powershell
cd frontend
npm start
```

**3. Acceder:**
- URL: http://localhost:4200
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📁 Archivos Excel (Base de Datos)

Los datos se guardan en la carpeta: `backend/data/`

### Archivos que se crean automáticamente:

1. **usuarios.xlsx** - Usuarios del sistema (admin, doctores, lectores)
2. **pacientes.xlsx** - Datos de pacientes/empleados
3. **cie10.xlsx** - Catálogo de códigos CIE-10
4. **registros-medicos.xlsx** - Registros de atención médica

### 💡 Ventajas:

- ✅ **No necesitas PostgreSQL**
- ✅ **Fácil de usar** - Son archivos Excel normales
- ✅ **Puedes editarlos directamente** - Abre con Excel/LibreOffice
- ✅ **Portátil** - Copia la carpeta `data` y listo
- ✅ **Backup simple** - Solo copia los archivos .xlsx
- ✅ **Ideal para demos y pruebas**

---

## 🔐 Credenciales por Defecto

Se crean automáticamente al iniciar el sistema:

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`
- Rol: Administrador completo

**Doctor:**
- Usuario: `doctor1`
- Contraseña: `doctor123`
- Rol: Doctor

---

## 📊 ¿Cómo funciona?

1. Al iniciar el backend, se crea automáticamente la carpeta `backend/data/`
2. Se generan archivos Excel con las tablas necesarias
3. Los datos se guardan automáticamente en los archivos Excel
4. Puedes abrir y editar los archivos Excel manualmente si lo necesitas

---

## 🎯 Características Incluidas

Todos los módulos funcionan exactamente igual que con PostgreSQL:

- ✅ Registro de Atención Médica (con contadores automáticos)
- ✅ Registro de Incidentes/Accidentes
- ✅ Registro Antidopaje (con exportación a Excel)
- ✅ Uso de Guantes
- ✅ Certificados Médicos
- ✅ Búsqueda de códigos CIE-10
- ✅ Integración con Squarenet (opcional)
- ✅ Auto-población de datos

---

## 📝 Agregar Datos Manualmente

Puedes agregar datos directamente editando los archivos Excel:

### Ejemplo: Agregar un nuevo código CIE-10

1. Abre `backend/data/cie10.xlsx` con Excel
2. Agrega una nueva fila:
   - ID: 15
   - Código: J18
   - Descripción: Neumonía, organismo no especificado
   - Categoría: Gripe y neumonía
   - Activo: TRUE
3. Guarda el archivo
4. Reinicia el backend

¡Los cambios aparecerán inmediatamente en el sistema!

---

## 🔄 Migrar de Excel a PostgreSQL (Futuro)

Si en el futuro necesitas migrar a PostgreSQL:

1. Los datos están en Excel - fácil de exportar
2. Cambia el script de inicio a usar `dev:postgres` en lugar de `dev`
3. Los controladores de PostgreSQL ya están implementados

---

## ⚠️ Limitaciones

- **Performance**: Excel es más lento que PostgreSQL con muchos datos (10,000+ registros)
- **Concurrencia**: Solo un proceso puede escribir a la vez
- **Búsquedas**: No hay índices como en bases de datos tradicionales

**Recomendación**: Perfecto para equipos pequeños (1-10 usuarios), demos y pruebas. Para producción con muchos usuarios, considera PostgreSQL.

---

## 🛠️ Troubleshooting

### Error: "Cannot find module 'exceljs'"

```powershell
cd backend
npm install
```

### Los archivos Excel no se crean

- Verifica que tienes permisos de escritura en la carpeta `backend/data/`
- Verifica que el backend esté corriendo correctamente

### No puedo editar los archivos Excel

- Cierra Excel/LibreOffice si lo tienes abierto
- El backend necesita acceso exclusivo para escribir

---

## 📞 Soporte

Sistema desarrollado para **Marbelize S.A.** © 2025

---

## ✅ Checklist de Verificación

- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Backend corriendo (puerto 3000)
- [ ] Frontend corriendo (puerto 4200)
- [ ] Carpeta `backend/data/` creada
- [ ] Archivos Excel generados
- [ ] Puedes hacer login con admin/admin123

¡El sistema está listo! 🎉





