# ESPECIFICACIÓN FUNCIONAL
## Sistema Médico Čuka Corp Group

**Código:** FOR-PY-03  
**Versión:** 1.0  
**Fecha:** 14/11/2025  
**Página 1 de 3**

---

## 1. Introducción y objetivos del requerimiento

### Resumen del requerimiento

El Sistema Médico Čuka Corp Group es una aplicación web desarrollada para gestionar de manera integral los registros médicos, certificados médicos, incidentes/accidentes laborales, controles de antidopaje, uso de guantes, dietas e ingreso de alimentos de los empleados de la organización. El sistema permite centralizar toda la información médica de los trabajadores, facilitando el seguimiento, control y generación de reportes en formato Excel y PDF.

El proyecto surge de la necesidad de digitalizar y automatizar los procesos médicos que anteriormente se realizaban de forma manual, mejorando la eficiencia, trazabilidad y cumplimiento normativo en el área de salud ocupacional.

### Objetivos del requerimiento

- **Centralizar la información médica:** Consolidar todos los registros médicos, certificados, incidentes y controles en una única plataforma accesible.
- **Automatizar procesos:** Reducir el tiempo de registro y búsqueda de información médica mediante autocompletado y validaciones automáticas.
- **Mejorar la trazabilidad:** Mantener un historial completo y accesible de todas las atenciones médicas de cada empleado.
- **Generar reportes:** Facilitar la exportación de datos históricos en formato Excel para análisis y reportes gerenciales.
- **Cumplimiento normativo:** Asegurar el registro adecuado de incidentes/accidentes laborales, certificados médicos y controles de salud ocupacional.
- **Integración con sistemas externos:** Conectar con sistemas de recursos humanos (Squarenet) para obtener datos actualizados de empleados.

### Alcance

**Dentro del alcance:**
- Registro de atenciones médicas con códigos CIE-10 y códigos secundarios
- Gestión de certificados médicos con cálculo automático de días laborables
- Registro de incidentes y accidentes laborales
- Control de antidopaje con resultados negativos/positivos
- Gestión de uso de guantes con fechas de inicio y fin
- Control de dietas e ingreso de alimentos (incluyendo ingreso indefinido)
- Búsqueda y autocompletado de información de pacientes desde sistema externo
- Generación de PDFs para certificados médicos y recetas
- Exportación de historiales a Excel
- Gestión de vulnerabilidades y discapacidades
- Envío de recetas por correo electrónico

**Fuera del alcance:**
- Sistema de facturación médica
- Gestión de inventario de medicamentos
- Programación de citas médicas
- Integración con sistemas de nómina para descuentos
- Aplicación móvil (solo versión web)

---

## 2. Descripción general del sistema

### Descripción funcional

El Sistema Médico es una aplicación web de arquitectura cliente-servidor que consta de:

- **Frontend:** Aplicación Angular que proporciona la interfaz de usuario con navegación por pestañas y formularios dinámicos.
- **Backend:** API REST desarrollada en Node.js/Express que gestiona la lógica de negocio y el almacenamiento de datos.
- **Base de datos:** Sistema híbrido que permite trabajar con PostgreSQL o archivos Excel según la configuración del entorno.

**Flujo de trabajo principal:**

1. **Autenticación:** El usuario (médico o administrador) inicia sesión con credenciales.
2. **Búsqueda de paciente:** Se ingresa el número de cédula y el sistema busca automáticamente la información del empleado desde Squarenet o base de datos local.
3. **Registro de atención:** Se completa el formulario de atención médica con códigos CIE-10, diagnósticos, prescripciones y opciones adicionales (incidentes, guantes, dieta).
4. **Guardado:** El sistema valida los datos y guarda múltiples registros relacionados según las opciones seleccionadas.
5. **Generación de documentos:** Se pueden generar PDFs de certificados médicos y recetas, y exportar historiales a Excel.

### Diagrama de procesos o flujo de datos

```
[Usuario] → [Login] → [Dashboard] → [Nueva Atención]
                                      ↓
                              [Búsqueda Paciente]
                                      ↓
                              [Carga Datos Squarenet]
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
        [Registro Médico]                    [Certificado Médico]
                    ↓                                   ↓
        ┌───────────┴───────────┐                      ↓
        ↓                       ↓              [Generación PDF]
[Incidentes]            [Guantes/Dieta]                ↓
        ↓                       ↓              [Guardado]
[Guardado]              [Guardado]                     ↓
        ↓                       ↓              [Excel Export]
[Excel Export]          [Excel Export]
```

---

## 3. Requisitos funcionales

### Casos de uso

**CU-01: Iniciar Sesión**
- **Actor:** Médico, Administrador
- **Descripción:** El usuario ingresa credenciales y accede al sistema
- **Precondiciones:** Usuario registrado en el sistema
- **Flujo principal:** Usuario ingresa usuario/contraseña → Sistema valida → Redirige a Dashboard
- **Flujo alternativo:** Credenciales incorrectas → Muestra mensaje de error

**CU-02: Buscar Paciente**
- **Actor:** Médico
- **Descripción:** Buscar información de un empleado por número de cédula
- **Precondiciones:** Usuario autenticado
- **Flujo principal:** Ingresa cédula → Sistema busca en Squarenet/BD → Carga datos automáticamente → Muestra información del paciente
- **Flujo alternativo:** Paciente no encontrado → Muestra mensaje de error

**CU-03: Registrar Atención Médica**
- **Actor:** Médico
- **Descripción:** Registrar una nueva atención médica con múltiples consultas
- **Precondiciones:** Paciente buscado y seleccionado
- **Flujo principal:** 
  1. Selecciona tipo de consulta y código CIE-10
  2. Opcionalmente selecciona código secundario
  3. Marca opciones adicionales (incidente, guantes, dieta)
  4. Completa evolución y prescripción
  5. Guarda registro
- **Postcondiciones:** Se crean registros en tablas correspondientes (médico, incidentes, guantes, dietas)

**CU-04: Generar Certificado Médico**
- **Actor:** Médico
- **Descripción:** Generar y descargar certificado médico en PDF
- **Precondiciones:** Datos del certificado completos
- **Flujo principal:** Completa formulario → Calcula días laborables → Genera PDF → Descarga archivo

**CU-05: Exportar Historial a Excel**
- **Actor:** Médico, Administrador
- **Descripción:** Exportar historial de registros médicos a Excel
- **Precondiciones:** Existencia de registros guardados
- **Flujo principal:** Selecciona módulo → Clic en "Descargar Historial" → Sistema genera Excel → Descarga archivo

### Funcionalidades requeridas

#### Módulo 1: Registro de Atención Médica
- **Búsqueda automática de pacientes:** Al ingresar cédula, busca automáticamente después de 800ms de inactividad
- **Múltiples consultas:** Permite agregar múltiples entradas de consulta con botón "+"
- **Códigos CIE-10:** Búsqueda y selección de códigos CIE-10 con descripción
- **Códigos secundarios:** Generación automática de códigos secundarios relacionados con CIE-10 principal
- **Campos condicionales:** 
  - Si es incidente: muestra campos de condición y días de reposo
  - Si requiere guantes: muestra fechas desde/hasta
  - Si requiere dieta: muestra fechas desde/hasta
  - Si requiere ingreso de alimentos: muestra fechas y checkbox de indefinido
- **Validaciones:** Requiere al menos un código CIE-10 y evolución médica antes de guardar

#### Módulo 2: Certificados Médicos
- **Cálculo automático:** Calcula días laborables y horas equivalentes (8 horas/día) basado en fechas desde/hasta
- **Validación de fechas:** Si fecha desde = fecha hasta, bloquea campos de días/horas
- **Historial de incidentes:** Botón para verificar si el paciente tiene incidentes/accidentes previos
- **Generación PDF:** Genera certificado médico en formato PDF con toda la información
- **Checkboxes:** Estado final, documento válido/no válido, enviado a revalidar

#### Módulo 3: Antidopaje
- **Checkboxes por tipo:** Cada tipo de doping tiene checkbox independiente
- **Resultados:** Checkboxes negativos/positivos por tipo (mutuamente excluyentes)
- **Observaciones:** Checkboxes ACUDE/NO ACUDE (mutuamente excluyentes)

#### Módulo 4: Uso de Guantes
- **Fechas:** Desde y hasta para período de uso de guantes
- **Relación con CIE-10:** Vinculado con código de diagnóstico

#### Módulo 5: Dieta/Ingreso de Alimentos
- **Separación:** Dos checkboxes independientes (Dieta e Ingreso de Alimentos)
- **Ingreso indefinido:** Checkbox que deshabilita fecha "Hasta" cuando está marcado
- **Fechas:** Desde y hasta para períodos de dieta o ingreso

### Reglas de negocio

1. **Validación de CIE-10:** Cada registro médico debe tener al menos un código CIE-10 válido
2. **Cálculo de días laborables:** Se calculan restando fecha desde menos fecha hasta, excluyendo fines de semana
3. **Cálculo de horas equivalentes:** Días laborables × 8 horas por día
4. **Fechas iguales:** Si fecha desde = fecha hasta en certificados, días laborables y horas quedan vacíos y bloqueados
5. **Código secundario:** Se genera automáticamente con formato INC-[CIE10]-[ID] y requiere confirmación del usuario
6. **Múltiples registros:** Una atención médica puede generar múltiples registros (médico, incidente, guantes, dieta) según opciones seleccionadas
7. **Búsqueda automática:** La búsqueda de paciente se ejecuta automáticamente después de 800ms de inactividad al cambiar la cédula
8. **Limpieza de formulario:** Al buscar un nuevo paciente, se limpian automáticamente los campos del formulario
9. **Ingreso indefinido:** Cuando se marca "indefinido" en ingreso de alimentos, la fecha "Desde" sigue siendo editable pero "Hasta" se deshabilita y limpia

### Roles y permisos

#### Administrador
- Acceso completo a todos los módulos
- Gestión de usuarios
- Exportación de historiales
- Visualización de todos los registros

#### Médico
- Acceso a módulos de atención médica
- Creación y edición de registros médicos
- Generación de certificados y recetas
- Exportación de historiales
- No puede gestionar usuarios

#### Lector (Reader)
- Solo lectura de registros
- No puede crear, editar o eliminar registros
- Puede exportar historiales

---

## 4. Requisitos de datos

### Definición de entidades y datos

#### Entidad: Paciente (Patient)
- **id:** Número entero (PK)
- **identification:** String (10-13 caracteres, único, requerido)
- **firstName:** String (requerido)
- **lastName:** String (requerido)
- **position:** String
- **workArea:** String
- **gender:** String (M/F)
- **phone:** String (opcional)
- **company:** String (requerido)
- **address:** String (opcional)
- **email:** String (opcional, formato email válido)
- **disability:** String (descripción de discapacidad, opcional)
- **vulnerable:** String (SI/NO)
- **vulnerableDescription:** String (descripción desde lista maestra)
- **vulnerableReversible:** Boolean (true/false)

#### Entidad: Registro Médico (MedicalRecord)
- **id:** Número entero (PK)
- **patientId:** Número entero (FK a Patient, requerido)
- **doctorId:** Número entero (FK a User, requerido)
- **date:** Date (requerido)
- **time:** String (formato HH:mm, requerido)
- **consultType:** String (requerido)
- **cie10Code:** String (opcional)
- **cie10Description:** String (opcional)
- **secondaryCode:** String (opcional)
- **secondaryDescription:** String (opcional)
- **causes:** String (opcional)
- **finalStatus:** String (ATENDIDO/AUSENTE)
- **diagnosis:** String (requerido)
- **prescription:** String (opcional)
- **prescriptionMedicines:** String (opcional)
- **prescriptionInstructions:** String (opcional)
- **daysOfRest:** Número entero (opcional)
- **observations:** String (opcional)
- **monthlyCount:** Número entero (contador mensual por código)
- **totalMonthlyCount:** Número entero (contador mensual total)
- **annualCount:** Número entero (contador anual)
- **certificateGenerated:** Boolean

#### Entidad: Certificado Médico (Certificate)
- **id:** Número entero (PK)
- **patientId:** Número entero (FK a Patient, requerido)
- **doctorId:** Número entero (FK a User, requerido)
- **date:** Date (requerido)
- **fromDate:** Date (requerido)
- **toDate:** Date (requerido)
- **workingDays:** Número entero (calculado)
- **equivalentHours:** Número entero (calculado)
- **finalStatus:** String (ATENDIDO/AUSENTE)
- **documentStatus:** String (VALIDO/NO VALIDO)
- **sentToRevalidate:** Boolean
- **comesFromIncident:** Boolean
- **observations:** String (opcional)
- **pdfGenerated:** Boolean

#### Entidad: Incidente (Incident)
- **id:** Número entero (PK)
- **patientId:** Número entero (FK a Patient, requerido)
- **doctorId:** Número entero (FK a User, requerido)
- **date:** Date (requerido)
- **cie10Code:** String (opcional)
- **cie10Description:** String (opcional)
- **secondaryCode:** String (opcional)
- **secondaryDescription:** String (opcional)
- **causes:** String (INCIDENTE/ACCIDENTE)
- **condition:** String (ESTABLE/GRAVE/CRÍTICO)
- **daysOfRest:** Número entero
- **diagnosis:** String
- **prescription:** String (opcional)
- **pdfGenerated:** Boolean

#### Entidad: Uso de Guantes (Gloves)
- **id:** Número entero (PK)
- **identification:** String (requerido)
- **startDate:** Date (requerido)
- **endDate:** Date (requerido)
- **cie10Code:** String (opcional)
- **cie10Description:** String (opcional)
- **secondaryCode:** String (opcional)
- **secondaryDescription:** String (opcional)
- **causes:** String (opcional)
- **observations:** String (opcional)
- **evolution:** String (opcional)

#### Entidad: Dieta (Diet)
- **id:** Número entero (PK)
- **identification:** String (requerido)
- **startDate:** Date (requerido)
- **endDate:** Date (opcional, requerido si no es indefinido)
- **cie10Code:** String (opcional)
- **cie10Description:** String (opcional)
- **secondaryCode:** String (opcional)
- **secondaryDescription:** String (opcional)
- **causes:** String (opcional)
- **observations:** String (opcional, "INGRESO INDEFINIDO" si aplica)
- **evolution:** String (opcional)

#### Entidad: Antidopaje (Antidoping)
- **id:** Número entero (PK)
- **patientId:** Número entero (FK a Patient, requerido)
- **doctorId:** Número entero (FK a User, requerido)
- **date:** Date (requerido)
- **dopingTypes:** JSON (tipos seleccionados)
- **results:** JSON (resultados por tipo: negativo/positivo)
- **observations:** String (ACUDE/NO ACUDE)
- **pdfGenerated:** Boolean

#### Entidad: Vulnerabilidad (Vulnerability)
- **id:** Número entero (PK)
- **code:** String (único, requerido)
- **description:** String (requerido)
- **category:** String (opcional)
- **isActive:** Boolean

### Modelo de datos (si aplica)

```
Patient (1) ──< (N) MedicalRecord
Patient (1) ──< (N) Certificate
Patient (1) ──< (N) Incident
Patient (1) ──< (N) Antidoping
User (1) ──< (N) MedicalRecord
User (1) ──< (N) Certificate
User (1) ──< (N) Incident
User (1) ──< (N) Antidoping
```

### Requisitos de integración

#### Integración con Squarenet
- **Propósito:** Obtener datos actualizados de empleados
- **Datos intercambiados:**
  - Número de identificación (input)
  - Nombre completo, puesto, área de trabajo, empresa, teléfono, dirección, género (output)
  - Descripción de discapacidad (output)
  - Descripción de vulnerabilidad (output)
- **Método:** API REST HTTP GET
- **Frecuencia:** Búsqueda bajo demanda cuando se ingresa cédula
- **Formato:** JSON

#### Integración con sistema de correo (SMTP)
- **Propósito:** Envío de recetas médicas por correo electrónico
- **Datos intercambiados:**
  - Email del paciente (input)
  - PDF de receta (adjunto)
  - Información del paciente y médico (cuerpo del correo)
- **Método:** SMTP (nodemailer)
- **Frecuencia:** Bajo demanda cuando se solicita envío de receta
- **Configuración requerida:** SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

---

## 5. Interfaces de usuario

### Mockups o wireframes

**Pantalla Principal - Dashboard:**
- Título: "Sistema Médico Čuka Corp Group"
- Card principal: "Nueva Atención" con enlace a registro médico
- Diseño limpio y moderno con colores corporativos

**Pantalla de Registro Médico:**
- Pestañas: Registro Médico | Antidopaje | Certificado Médico
- Sección colapsable: Datos del paciente (con búsqueda por cédula)
- Sección: Datos de la consulta (múltiples entradas con botón "+")
- Campos condicionales según checkboxes seleccionados
- Botones: Guardar Atención Médica | Descargar Historial | Receta | Volver

**Pantalla de Certificado Médico:**
- Formulario completo con fechas desde/hasta
- Campos calculados automáticamente (días laborables, horas)
- Botón: Historial Incidente/Accidente
- Botones: Guardar | Imprimir/Guardar PDF | Descargar Historial

### Flujo de navegación

```
Login → Dashboard → Nueva Atención
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
  Registro Médico   Antidopaje    Certificado Médico
        ↓                 ↓                 ↓
  [Guardar]         [Guardar]      [Guardar/PDF]
        ↓                 ↓                 ↓
  [Excel Export]    [Excel Export]  [Excel Export]
```

### Requisitos de UX

**Estándares de diseño:**
- **Colores principales:**
  - Azul corporativo: #2563eb (botones primarios, enlaces)
  - Rojo: #dc2626 (alertas, campos importantes)
  - Verde: #16a34a (éxito, confirmaciones)
  - Gris claro: #f5f5f5 (fondos de secciones)
  - Blanco: #ffffff (fondos principales)

- **Tipografía:**
  - Fuente principal: Sistema (Arial, Helvetica, sans-serif)
  - Títulos: Bold, tamaño 18-24px
  - Texto normal: Regular, tamaño 14-16px
  - Labels: Medium, tamaño 12-14px

- **Estilo:**
  - Diseño moderno y limpio
  - Formularios con campos agrupados lógicamente
  - Botones con iconos FontAwesome
  - Mensajes de éxito/error claros y visibles
  - Secciones colapsables para mejor organización
  - Responsive design (adaptable a diferentes tamaños de pantalla)

- **Interacciones:**
  - Búsqueda automática con debounce (800ms)
  - Validaciones en tiempo real
  - Mensajes de confirmación para acciones importantes
  - Loading states en botones durante operaciones
  - Tooltips informativos donde sea necesario

---

**Código:** FOR-PY-03  
**Versión:** 1.0  
**Fecha:** 14/11/2025  
**Página 2 de 3**

---

## 6. Requisitos no funcionales

### Rendimiento y capacidad

- **Tiempo de respuesta:**
  - Búsqueda de paciente: < 2 segundos
  - Guardado de registro: < 3 segundos
  - Generación de PDF: < 5 segundos
  - Exportación a Excel: < 10 segundos (dependiendo del volumen de datos)

- **Capacidad:**
  - Usuarios concurrentes: Mínimo 10 usuarios simultáneos
  - Volumen de datos: Soporte para al menos 10,000 registros médicos
  - Tamaño de archivos: PDFs hasta 5MB, Excel hasta 10MB
  - Búsquedas: Soporte para búsquedas en tiempo real sin degradación de rendimiento

- **Disponibilidad:**
  - Tiempo de actividad: 99% durante horario laboral (8:00 AM - 6:00 PM)
  - Tolerancia a fallos: Sistema debe recuperarse automáticamente de errores menores

### Seguridad

- **Autenticación:**
  - Sistema de login con usuario y contraseña
  - Contraseñas almacenadas con hash bcrypt
  - Tokens JWT para sesiones (opcional para futuras mejoras)
  - Timeout de sesión después de 30 minutos de inactividad

- **Autorización:**
  - Control de acceso basado en roles (Administrador, Médico, Lector)
  - Validación de permisos en backend para todas las operaciones
  - Protección contra acceso no autorizado a datos de pacientes

- **Protección de datos:**
  - Datos sensibles de pacientes protegidos
  - Validación de entrada en frontend y backend
  - Protección contra inyección SQL (usando Sequelize ORM)
  - Sanitización de datos de entrada
  - HTTPS recomendado para producción

- **Auditoría:**
  - Registro de acciones importantes (creación, edición, eliminación)
  - Trazabilidad de quién realizó cada acción y cuándo

---

## 7. Criterios de aceptación

Para que el sistema sea considerado completo y funcional, debe cumplir con los siguientes criterios:

1. **Búsqueda de pacientes:**
   - ✅ El sistema busca automáticamente pacientes al ingresar cédula después de 800ms
   - ✅ Carga datos desde Squarenet o base de datos local
   - ✅ Muestra mensaje de error si el paciente no existe

2. **Registro de atención médica:**
   - ✅ Permite agregar múltiples consultas con botón "+"
   - ✅ Valida que exista al menos un código CIE-10 antes de guardar
   - ✅ Guarda registros relacionados (incidentes, guantes, dieta) según opciones seleccionadas
   - ✅ Limpia formulario al buscar nuevo paciente

3. **Certificados médicos:**
   - ✅ Calcula automáticamente días laborables y horas equivalentes
   - ✅ Bloquea campos de días/horas cuando fechas son iguales
   - ✅ Genera PDF con toda la información del certificado
   - ✅ Valida historial de incidentes/accidentes previos

4. **Exportación a Excel:**
   - ✅ Exporta historiales de todos los módulos (médico, certificados, guantes, dieta)
   - ✅ Incluye todos los campos relacionados (incidentes, guantes, dieta, vulnerabilidades)
   - ✅ Genera archivo Excel descargable

5. **Antidopaje:**
   - ✅ Permite seleccionar múltiples tipos de doping con checkboxes
   - ✅ Resultados negativos/positivos mutuamente excluyentes por tipo
   - ✅ Observaciones ACUDE/NO ACUDE mutuamente excluyentes

6. **Uso de guantes y dieta:**
   - ✅ Permite registrar períodos con fechas desde/hasta
   - ✅ Ingreso de alimentos con opción de indefinido
   - ✅ Cuando es indefinido, fecha "Hasta" se deshabilita

7. **Seguridad:**
   - ✅ Sistema de autenticación funcional
   - ✅ Control de acceso por roles
   - ✅ Validación de datos en frontend y backend

---

## 8. Consideraciones adicionales

### Limitaciones y riesgos

**Limitaciones técnicas:**
- El sistema depende de la disponibilidad del servicio Squarenet para obtener datos de empleados
- La generación de PDFs requiere librerías específicas (jsPDF) que pueden tener limitaciones de formato
- El almacenamiento en Excel tiene limitaciones de tamaño (máximo recomendado: 1 millón de filas)
- La exportación a Excel puede ser lenta con grandes volúmenes de datos (>10,000 registros)

**Riesgos identificados:**
1. **Riesgo de pérdida de datos:**
   - **Mitigación:** Implementar backups regulares de archivos Excel y base de datos PostgreSQL
   - **Contingencia:** Sistema de respaldo automático diario

2. **Riesgo de indisponibilidad del servicio Squarenet:**
   - **Mitigación:** Sistema funciona con datos locales cuando Squarenet no está disponible
   - **Contingencia:** Mantener caché de datos de pacientes en base de datos local

3. **Riesgo de errores en cálculos de días laborables:**
   - **Mitigación:** Validación exhaustiva de lógica de cálculo
   - **Contingencia:** Permitir edición manual de días/horas si es necesario

4. **Riesgo de problemas de rendimiento con grandes volúmenes:**
   - **Mitigación:** Optimización de consultas y uso de índices en base de datos
   - **Contingencia:** Implementar paginación en listados y exportaciones

5. **Riesgo de seguridad en envío de correos:**
   - **Mitigación:** Validación de configuración SMTP y manejo seguro de credenciales
   - **Contingencia:** Sistema de logs para rastrear envíos fallidos

**Consideraciones de mantenimiento:**
- Actualización periódica de códigos CIE-10
- Mantenimiento de lista maestra de vulnerabilidades
- Actualización de dependencias de seguridad
- Monitoreo de rendimiento y optimización continua

**Consideraciones de escalabilidad:**
- El sistema está diseñado para crecer con la organización
- Arquitectura permite migración completa a PostgreSQL cuando sea necesario
- Código modular facilita agregar nuevos módulos o funcionalidades

---

**Código:** FOR-PY-03  
**Versión:** 1.0  
**Fecha:** 14/11/2025  
**Página 3 de 3**

---

**MARBELIZE S.A.**  
Proyectos, Procesos y Mejora Continua  
Especificación Funcional

