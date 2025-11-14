# 🚀 GUÍA RÁPIDA - Iniciar Sistema Marbelize

## ⚡ FORMA MÁS RÁPIDA (Recomendada)

### Paso 1: Haz doble clic en estos archivos (en este orden):

1. **`iniciar-backend.bat`** ← Primero este
2. Espera 10 segundos
3. **`iniciar-frontend.bat`** ← Después este
4. Espera 30 segundos
5. Abre tu navegador en: **http://localhost:4200**

---

## 📝 ALTERNATIVA: Usando PowerShell Manualmente

### Abrir DOS ventanas de PowerShell:

**Ventana 1 - Backend:**
```powershell
cd "C:\Users\proc-inge\Cursor\sistema-medico\backend"
npm run dev
```

**Ventana 2 - Frontend:**
```powershell
cd "C:\Users\proc-inge\Cursor\sistema-medico\frontend"
npm start
```

---

## ⚠️ IMPORTANTE ANTES DE INICIAR

¿Ya configuraste la base de datos? Si no:

1. Abre PostgreSQL (pgAdmin)
2. Ejecuta: `CREATE DATABASE sistema_medico;`
3. Haz doble clic en: **`CONFIGURAR_DB.bat`**

---

## 🔐 Credenciales

- **Usuario:** admin
- **Contraseña:** admin123

---

## 🎯 Verificar que funciona

Después de iniciar los dos archivos .bat, deberías ver:

**Backend (ventana 1):**
```
╔══════════════════════════════════════════════╗
║  Portal de atención médica Marbelize S.A.   ║
║  ✅ Servidor iniciado exitosamente           ║
║  🚀 Puerto: 3000                             ║
╚══════════════════════════════════════════════╝
```

**Frontend (ventana 2):**
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

---

## ❌ Si no funciona

1. **Error de base de datos:**
   - Verifica que PostgreSQL está corriendo
   - Ejecuta: `CONFIGURAR_DB.bat`

2. **Puerto ocupado:**
   - Cierra cualquier otra aplicación en puerto 3000 o 4200
   - O reinicia tu computadora

3. **Error "Cannot find module":**
   - Abre PowerShell en la carpeta del proyecto
   - Ejecuta:
     ```powershell
     cd backend
     npm install
     cd ../frontend
     npm install
     ```

---

## 🌐 Acceder al Sistema

Una vez que ambos servidores estén corriendo (espera 30 segundos):

👉 **http://localhost:4200**

¡Eso es todo! 🎉





