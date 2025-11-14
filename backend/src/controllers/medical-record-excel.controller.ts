import { Request, Response } from 'express';
import excelDB from '../utils/excel-database';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import multer from 'multer';

interface Incident {
  id: number;
  patientId: number;
  date: string;
  condition?: string;
  [key: string]: any;
}

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id;
    const { patientId, date, time, consultType, cie10Code, diagnosis, prescription, daysOfRest, observations, finalStatus, cie10Description, secondaryCode, secondaryDescription, causes } = req.body;

    logger.info(`Creando registro médico para paciente: ${patientId}`);

    // Obtener descripción del CIE-10 si se proporciona código
    // Usar los valores del body si están presentes, de lo contrario calcularlos
    let finalCie10Description = cie10Description || '';
    let finalCauses = causes || '';
    if (cie10Code && !finalCie10Description) {
      const codes = await excelDB.getCIE10Codes();
      const cie10 = codes.find(c => c.code === cie10Code);
      if (cie10) {
        finalCie10Description = cie10.description;
        // Si la categoría es INCIDENTE o ACCIDENTE, usar esa como causa
        if (cie10.category === 'INCIDENTE' || cie10.category === 'ACCIDENTE') {
          finalCauses = cie10.category;
        } else {
          finalCauses = cie10.description; // Se auto-llena con la descripción para otros casos
        }
      }
    }

    // Calcular contadores
    const allRecords = await excelDB.getMedicalRecords();
    const patientRecords = allRecords.filter(r => r.patientId === patientId);

    const currentDate = new Date(date);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyRecords = patientRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    const monthlyCodeRecords = monthlyRecords.filter(r => r.cie10Code === cie10Code);

    const annualRecords = patientRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate.getFullYear() === currentYear;
    });

    const medicalRecord = await excelDB.createMedicalRecord({
      patientId,
      doctorId,
      date,
      time,
      consultType,
      cie10Code,
      cie10Description: finalCie10Description,
      secondaryCode: secondaryCode || undefined,
      secondaryDescription: secondaryDescription || undefined,
      causes: finalCauses,
      finalStatus: finalStatus || undefined,
      diagnosis,
      prescription,
      daysOfRest: daysOfRest || 0,
      observations,
      monthlyCount: monthlyCodeRecords.length + 1,
      totalMonthlyCount: monthlyRecords.length + 1,
      annualCount: annualRecords.length + 1,
      certificateGenerated: false,
    });

    logger.info(`Registro médico creado en Excel: ${medicalRecord.id}`);

    res.status(201).json({
      success: true,
      message: 'Registro de atención médica guardado exitosamente',
      data: medicalRecord,
    });
  } catch (error: any) {
    logger.error('Error al crear registro médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear registro médico',
      error: error.message,
    });
  }
};

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let records = await excelDB.getMedicalRecords();

    // Filtrar por paciente si se proporciona
    if (patientId) {
      records = records.filter(r => r.patientId === Number(patientId));
    }

    // Obtener todos los pacientes y usuarios (doctores) para enriquecer los registros
    const patients = await excelDB.getPatients();
    const users = await excelDB.getUsers();
    const patientsMap = new Map(patients.map(p => [p.id, p]));
    const usersMap = new Map(users.map(u => [u.id, u]));

    // Enriquecer registros con información del paciente y del doctor
    const enrichedRecords = records.map(record => {
      const patient = patientsMap.get(record.patientId);
      const doctor = usersMap.get(record.doctorId);
      return {
        ...record,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          fullName: `${patient.firstName} ${patient.lastName}`.trim(),
          identification: patient.identification
        } : null,
        doctor: doctor ? {
          id: doctor.id,
          fullName: doctor.fullName || '',
          username: doctor.username || ''
        } : null,
        doctorName: doctor?.fullName || ''
      };
    });

    // Ordenar por fecha y hora descendente
    enrichedRecords.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    res.json({
      success: true,
      data: enrichedRecords,
      pagination: {
        total: enrichedRecords.length,
        page: 1,
        limit: enrichedRecords.length,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    logger.error('Error al obtener registros médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros médicos',
      error: error.message,
    });
  }
};

export const getSecondaryCodeByCIE10 = async (req: Request, res: Response) => {
  try {
    const { cie10Code } = req.query;

    if (!cie10Code || typeof cie10Code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Código CIE-10 es requerido'
      });
    }

    logger.info(`Buscando código secundario para CIE-10: ${cie10Code}`);

    // Obtener todos los registros médicos
    const allRecords = await excelDB.getMedicalRecords();

    // Buscar registros con el mismo código CIE-10 que tengan código secundario
    const recordsWithSecondaryCode = allRecords.filter(record => 
      record.cie10Code === cie10Code && 
      record.secondaryCode && 
      record.secondaryCode.trim() !== ''
    );

    if (recordsWithSecondaryCode.length === 0) {
      return res.json({
        success: true,
        hasSecondaryCode: false,
        data: null
      });
    }

    // Obtener el código secundario más reciente (ordenar por fecha descendente)
    const sortedRecords = recordsWithSecondaryCode.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    const mostRecentRecord = sortedRecords[0];

    logger.info(`Código secundario encontrado: ${mostRecentRecord.secondaryCode} para CIE-10: ${cie10Code}`);

    return res.json({
      success: true,
      hasSecondaryCode: true,
      data: {
        secondaryCode: mostRecentRecord.secondaryCode,
        secondaryDescription: mostRecentRecord.secondaryDescription || ''
      }
    });
  } catch (error: any) {
    logger.error(`Error buscando código secundario: ${error.message}`, { error });
    return res.status(500).json({
      success: false,
      message: 'Error al buscar código secundario',
      error: error.message
    });
  }
};

export const exportMedicalRecordsToExcel = async (req: Request, res: Response) => {
  try {
    logger.info('Exportando registros médicos a Excel');

    const records = await excelDB.getMedicalRecords();
    
    // Obtener pacientes y usuarios para enriquecer datos
    const patients = await excelDB.getPatients();
    const users = await excelDB.getUsers();
    const patientsMap = new Map(patients.map(p => [p.id, p]));
    const usersMap = new Map(users.map(u => [u.id, u]));

    // Obtener registros relacionados para enriquecer datos
    const incidents = await excelDB.getIncidents();
    const gloves = await excelDB.getGlovesRecords();
    const diets = await excelDB.getDietRecords();
    
    // Crear mapas para búsqueda rápida
    const incidentsByPatientAndDate = new Map<string, Incident>();
    incidents.forEach(inc => {
      const key = `${inc.patientId}_${inc.date}`;
      incidentsByPatientAndDate.set(key, inc);
    });
    
    const glovesByPatientAndDate = new Map<string, any>();
    gloves.forEach(gl => {
      const key = `${gl.identification}_${gl.startDate}`;
      glovesByPatientAndDate.set(key, gl);
    });
    
    const dietsByPatientAndDate = new Map<string, any>();
    diets.forEach(diet => {
      const key = `${diet.identification}_${diet.startDate}`;
      dietsByPatientAndDate.set(key, diet);
    });

    // Enriquecer registros
    const enrichedRecords = records.map(record => {
      const patient = patientsMap.get(record.patientId);
      const doctor = usersMap.get(record.doctorId);
      
      // Buscar registros relacionados
      const incidentKey = `${record.patientId}_${record.date}`;
      const incident = incidentsByPatientAndDate.get(incidentKey);
      
      const glovesKey = `${patient?.identification || ''}_${record.date}`;
      const glovesRecord = glovesByPatientAndDate.get(glovesKey);
      
      const dietKey = `${patient?.identification || ''}_${record.date}`;
      const dietRecord = dietsByPatientAndDate.get(dietKey);
      
      return {
        ...record,
        patientName: patient ? `${patient.firstName} ${patient.lastName}`.trim() : '',
        identification: patient?.identification || '',
        workArea: patient?.workArea || '',
        position: patient?.position || '',
        company: patient?.company || '',
        gender: patient?.gender || '',
        disability: patient?.disability || '', // Descripción de discapacidad
        vulnerableDescription: patient?.vulnerableDescription || '', // Descripción de vulnerabilidad desde lista maestra
        vulnerableReversible: patient?.vulnerableReversible || false, // Si la vulnerabilidad es reversible
        doctorName: doctor?.fullName || '',
        isIncident: incident ? 'SI' : 'NO',
        incidentCondition: incident?.condition || '',
        needsGloves: glovesRecord ? 'SI' : 'NO',
        glovesStartDate: glovesRecord?.startDate || '',
        glovesEndDate: glovesRecord?.endDate || '',
        needsDiet: dietRecord && !dietRecord.observations?.includes('INGRESO INDEFINIDO') ? 'SI' : 'NO',
        dietStartDate: dietRecord && !dietRecord.observations?.includes('INGRESO INDEFINIDO') ? (dietRecord.startDate || '') : '',
        dietEndDate: dietRecord && !dietRecord.observations?.includes('INGRESO INDEFINIDO') ? (dietRecord.endDate || '') : '',
        needsFoodIntake: dietRecord && dietRecord.observations?.includes('INGRESO INDEFINIDO') ? 'SI' : (dietRecord && !dietRecord.observations?.includes('INGRESO INDEFINIDO') ? 'NO' : ''),
        indefiniteFoodIntake: dietRecord && dietRecord.observations?.includes('INGRESO INDEFINIDO') ? 'SI' : 'NO',
        foodIntakeStartDate: dietRecord && dietRecord.observations?.includes('INGRESO INDEFINIDO') ? (dietRecord.startDate || '') : '',
        foodIntakeEndDate: dietRecord && dietRecord.observations?.includes('INGRESO INDEFINIDO') ? (dietRecord.endDate || '') : ''
      };
    });

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Registros Médicos');

    // Definir columnas
    worksheet.columns = [
      { header: 'FECHA', key: 'date', width: 15 },
      { header: 'HORA', key: 'time', width: 12 },
      { header: 'CEDULA', key: 'identification', width: 15 },
      { header: 'NOMBRES Y APELLIDOS', key: 'fullName', width: 40 },
      { header: 'EMPRESA', key: 'company', width: 25 },
      { header: 'GENERO', key: 'gender', width: 12 },
      { header: 'DISCAPACIDAD', key: 'disability', width: 40 },
      { header: 'VULNERABILIDAD', key: 'vulnerableDescription', width: 40 },
      { header: 'VULNERABILIDAD REVERSIBLE', key: 'vulnerableReversible', width: 25 },
      { header: 'AREA DE TRABAJO', key: 'workArea', width: 30 },
      { header: 'PUESTO DE TRABAJO', key: 'position', width: 30 },
      { header: 'TIPO DE CONSULTA', key: 'consultType', width: 25 },
      { header: 'CIE-10', key: 'cie10Code', width: 15 },
      { header: 'DESCRIPCION CIE-10', key: 'cie10Description', width: 50 },
      { header: 'COD. SEC', key: 'secondaryCode', width: 15 },
      { header: 'DESCRIPCION COD. SEC', key: 'secondaryDescription', width: 50 },
      { header: 'CAUSAS', key: 'causes', width: 40 },
      { header: 'DIAGNOSTICO', key: 'diagnosis', width: 50 },
      { header: 'RECETA', key: 'prescription', width: 50 },
      { header: 'DIAS DE REPOSO', key: 'daysOfRest', width: 15 },
      { header: 'ESTADO FINAL', key: 'finalStatus', width: 20 },
      { header: 'ES INCIDENTE/ACCIDENTE', key: 'isIncident', width: 25 },
      { header: 'CONDICION INCIDENTE', key: 'incidentCondition', width: 25 },
      { header: 'REQUIERE USO DE GUANTES', key: 'needsGloves', width: 25 },
      { header: 'FECHA DESDE GUANTES', key: 'glovesStartDate', width: 20 },
      { header: 'FECHA HASTA GUANTES', key: 'glovesEndDate', width: 20 },
      { header: 'REQUIERE DIETA', key: 'needsDiet', width: 20 },
      { header: 'FECHA DESDE DIETA', key: 'dietStartDate', width: 20 },
      { header: 'FECHA HASTA DIETA', key: 'dietEndDate', width: 20 },
      { header: 'REQUIERE INGRESO ALIMENTOS', key: 'needsFoodIntake', width: 30 },
      { header: 'INGRESO INDEFINIDO', key: 'indefiniteFoodIntake', width: 25 },
      { header: 'FECHA DESDE INGRESO', key: 'foodIntakeStartDate', width: 20 },
      { header: 'FECHA HASTA INGRESO', key: 'foodIntakeEndDate', width: 20 },
      { header: 'CONTADOR MENSUAL POR CODIGO', key: 'monthlyCount', width: 30 },
      { header: 'CONTADOR MENSUAL TOTAL', key: 'totalMonthlyCount', width: 30 },
      { header: 'CONTADOR ANUAL', key: 'annualCount', width: 20 },
      { header: 'OBSERVACIONES', key: 'observations', width: 40 },
      { header: 'MEDICO', key: 'doctorName', width: 30 },
    ];

    // Estilizar encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE3F2FD' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Función para formatear fecha
    const formatDate = (dateStr: string | Date | null): string => {
      if (!dateStr) return '';
      try {
        const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return String(dateStr);
      }
    };

    // Función para formatear SI/NO (para vulnerabilidad reversible)
    const formatSiNo = (value: boolean | null | undefined): string => {
      if (value === true) {
        return 'SI';
      }
      return 'NO';
    };

    // Agregar datos
    enrichedRecords.forEach(record => {
      worksheet.addRow({
        date: formatDate(record.date),
        time: record.time || '',
        identification: record.identification || '',
        fullName: record.patientName || '',
        company: record.company || '',
        gender: record.gender || '',
        disability: record.disability || '', // Descripción de discapacidad
        vulnerableDescription: record.vulnerableDescription || '', // Descripción de vulnerabilidad
        vulnerableReversible: formatSiNo(record.vulnerableReversible), // Si es reversible
        workArea: record.workArea || '',
        position: record.position || '',
        consultType: record.consultType || '',
        cie10Code: record.cie10Code || '',
        cie10Description: record.cie10Description || '',
        secondaryCode: record.secondaryCode || '',
        secondaryDescription: record.secondaryDescription || '',
        causes: record.causes || '',
        diagnosis: record.diagnosis || '',
        prescription: record.prescription || '',
        daysOfRest: record.daysOfRest || 0,
        finalStatus: record.finalStatus || '',
        isIncident: (record as any).isIncident || 'NO',
        incidentCondition: (record as any).incidentCondition || '',
        needsGloves: (record as any).needsGloves || 'NO',
        glovesStartDate: (record as any).glovesStartDate ? formatDate((record as any).glovesStartDate) : '',
        glovesEndDate: (record as any).glovesEndDate ? formatDate((record as any).glovesEndDate) : '',
        needsDiet: (record as any).needsDiet || 'NO',
        dietStartDate: (record as any).dietStartDate ? formatDate((record as any).dietStartDate) : '',
        dietEndDate: (record as any).dietEndDate ? formatDate((record as any).dietEndDate) : '',
        needsFoodIntake: (record as any).needsFoodIntake || '',
        indefiniteFoodIntake: (record as any).indefiniteFoodIntake || 'NO',
        foodIntakeStartDate: (record as any).foodIntakeStartDate ? formatDate((record as any).foodIntakeStartDate) : '',
        foodIntakeEndDate: (record as any).foodIntakeEndDate ? formatDate((record as any).foodIntakeEndDate) : '',
        monthlyCount: record.monthlyCount || 0,
        totalMonthlyCount: record.totalMonthlyCount || 0,
        annualCount: record.annualCount || 0,
        observations: record.observations || '',
        doctorName: record.doctorName || ''
      });

      // Aplicar estilo alternado
      const rowNumber = worksheet.rowCount;
      if (rowNumber % 2 === 0) {
        const row = worksheet.getRow(rowNumber);
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }

      // Bordes a todas las filas
      const row = worksheet.getRow(rowNumber);
      row.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      row.alignment = { vertical: 'top', wrapText: true };
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Historial_Registros_Medicos_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);

    logger.info(`Historial de registros médicos exportado: ${enrichedRecords.length} registros`);
  } catch (error: any) {
    logger.error('Error al exportar registros médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar historial',
      error: error.message,
    });
  }
};

// Configurar multer para manejar archivos
const upload = multer({ storage: multer.memoryStorage() });

export const sendPrescriptionEmail = async (req: Request, res: Response) => {
  try {
    const { email, patientName, patientIdentification } = req.body;
    const file = req.file;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Correo electrónico es requerido'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Archivo PDF es requerido'
      });
    }

    logger.info(`Enviando receta por correo a: ${email}`);

    // Verificar configuración de correo antes de intentar enviar
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.error('Configuración de SMTP no encontrada. No se puede enviar el correo.');
      return res.status(500).json({
        success: false,
        message: 'El servidor de correo no está configurado. Por favor, contacte al administrador del sistema.',
        error: 'SMTP configuration missing'
      });
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Para desarrollo, en producción debería ser true
      }
    });

    // Configurar el correo
    const mailOptions = {
      from: process.env.SMTP_USER || 'sistema-medico@marbelize.com',
      to: email,
      subject: `Receta Médica - ${patientName || 'Paciente'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Receta Médica</h2>
          <p>Estimado/a paciente,</p>
          <p>Se adjunta su receta médica correspondiente a la atención del día ${new Date().toLocaleDateString('es-ES')}.</p>
          <p><strong>Paciente:</strong> ${patientName || 'N/A'}</p>
          <p><strong>Identificación:</strong> ${patientIdentification || 'N/A'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Este correo fue generado automáticamente por el Sistema Médico Marbelize S.A.<br>
            Por favor, no responda a este correo.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: file.originalname || 'Receta_Medica.pdf',
          content: file.buffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Verificar conexión antes de enviar
    try {
      await transporter.verify();
      logger.info('Conexión SMTP verificada exitosamente');
    } catch (verifyError: any) {
      logger.error(`Error verificando conexión SMTP: ${verifyError.message}`, { verifyError });
      return res.status(500).json({
        success: false,
        message: 'No se pudo conectar al servidor de correo. Verifique la configuración SMTP.',
        error: verifyError.message
      });
    }

    // Enviar correo
    const info = await transporter.sendMail(mailOptions);

    logger.info(`Receta enviada exitosamente a ${email}. MessageId: ${info.messageId}`);

    return res.json({
      success: true,
      message: 'Receta enviada por correo exitosamente',
      data: {
        messageId: info.messageId,
        email: email
      }
    });
  } catch (error: any) {
    logger.error(`Error enviando receta por correo: ${error.message}`, { error });
    
    // Mensajes de error más específicos
    let errorMessage = 'Error al enviar la receta por correo';
    if (error.code === 'EAUTH') {
      errorMessage = 'Error de autenticación con el servidor de correo. Verifique las credenciales SMTP.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar al servidor de correo. Verifique la configuración SMTP_HOST y SMTP_PORT.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Error de conexión con el servidor de correo. Verifique su conexión a internet y la configuración SMTP.';
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

// Exportar upload para usar en las rutas
export { upload };


