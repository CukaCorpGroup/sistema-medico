import { Request, Response } from 'express';
import excelDB from '../utils/excel-database';
import squarenetService from '../utils/squarenet.service';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id;
    const {
      patientId,
      identification,
      date,
      clinicalHistory,
      cie10Code,
      diagnosis,
      contingencyType,
      evolution,
      description,
      sentToRevalidate,
      fromDate,
      toDate,
      hours,
      workingDays,
      days,
      equivalentHours,
      generalIllness,
      accident,
      issuingInstitution,
      specialtyB,
      issuingDoctor,
      serviceC,
      causes,
      validDocument,
      invalidDocument,
      doctorD,
      fromIncidentAccident,
      medicalAttentionInfo,
      company,
      position,
      workArea,
      phone,
      address,
    } = req.body;

    logger.info(`Creando certificado médico para paciente: ${patientId || identification}`);

    // Buscar paciente en Excel o crear desde Squarenet
    const patients = await excelDB.getPatients();
    let patient = patientId 
      ? patients.find(p => p.id === Number(patientId))
      : patients.find(p => p.identification === identification);

    if (!patient && identification) {
      try {
        const employeeData = await squarenetService.searchEmployeeByIdentification(identification);
        
        if (employeeData) {
          patient = await excelDB.createPatient({
            identification: employeeData.identification,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            position: employeeData.position,
            workArea: employeeData.workArea,
            gender: employeeData.gender,
            phone: employeeData.phone,
            email: employeeData.email,
            company: employeeData.company,
            address: employeeData.address,
          });
        }
      } catch (error) {
        logger.warn('Error al buscar empleado en Squarenet:', error);
      }
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado',
      });
    }

    // Crear certificado
    const certificate = await excelDB.createCertificate({
      patientId: patient.id,
      doctorId,
      date: date || new Date().toISOString().split('T')[0],
      identification: patient.identification,
      fullName: `${patient.firstName} ${patient.lastName}`,
      position: position || patient.position,
      workArea: workArea || patient.workArea,
      phone: phone || patient.phone,
      company: company || patient.company,
      address: address || patient.address,
      clinicalHistory,
      cie10Code,
      diagnosis,
      contingencyType,
      evolution,
      description,
      sentToRevalidate: sentToRevalidate || false,
      fromDate,
      toDate,
      hours: hours || 0,
      workingDays: workingDays || 0,
      days: days || 0,
      equivalentHours: equivalentHours || 0,
      generalIllness: generalIllness || false,
      accident: accident || false,
      issuingInstitution,
      specialtyB,
      issuingDoctor,
      serviceC,
      causes,
      validDocument: validDocument || false,
      invalidDocument: invalidDocument || false,
      doctorD,
      fromIncidentAccident: fromIncidentAccident || false,
      medicalAttentionInfo,
    });

    logger.info(`Certificado médico creado en Excel: ${certificate.id}`);

    res.status(201).json({
      success: true,
      message: 'Certificado médico guardado exitosamente',
      data: certificate,
    });
  } catch (error: any) {
    logger.error('Error al crear certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear certificado',
      error: error.message,
    });
  }
};

export const getCertificates = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let records = await excelDB.getCertificates();

    // Filtrar por paciente si se proporciona
    if (patientId) {
      records = records.filter(r => r.patientId === Number(patientId));
    }

    // Obtener todos los pacientes y usuarios (doctores) para enriquecer los registros
    const patients = await excelDB.getPatients();
    const users = await excelDB.getUsers();

    const enrichedRecords = records.map(record => {
      const patient = patients.find(p => p.id === record.patientId);
      const doctor = users.find(u => u.id === record.doctorId);

      return {
        ...record,
        patient: patient ? {
          id: patient.id,
          identification: patient.identification,
          firstName: patient.firstName,
          lastName: patient.lastName,
          fullName: `${patient.firstName} ${patient.lastName}`,
          position: patient.position,
          workArea: patient.workArea,
          company: patient.company,
          phone: patient.phone,
          address: patient.address,
        } : null,
        doctor: doctor ? {
          id: doctor.id,
          fullName: doctor.fullName,
          email: doctor.email,
        } : null,
      };
    });

    res.json({
      success: true,
      data: enrichedRecords,
      total: enrichedRecords.length,
    });
  } catch (error: any) {
    logger.error('Error al obtener certificados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener certificados',
      error: error.message,
    });
  }
};

export const exportCertificatesToExcel = async (req: Request, res: Response) => {
  try {
    logger.info('Exportando certificados médicos a Excel');
    const records = await excelDB.getCertificates();
    const patients = await excelDB.getPatients();
    const users = await excelDB.getUsers();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Certificados Médicos');

    worksheet.columns = [
      { header: 'FECHA', key: 'date', width: 15 },
      { header: 'CEDULA', key: 'identification', width: 15 },
      { header: 'NOMBRES Y APELLIDOS', key: 'fullName', width: 40 },
      { header: 'EMPRESA', key: 'company', width: 25 },
      { header: 'AREA DE TRABAJO', key: 'workArea', width: 30 },
      { header: 'PUESTO DE TRABAJO', key: 'position', width: 30 },
      { header: 'TELEFONO', key: 'phone', width: 15 },
      { header: 'DIRECCION', key: 'address', width: 50 },
      { header: 'HISTORIA CLINICA', key: 'clinicalHistory', width: 30 },
      { header: 'CIE-10', key: 'cie10Code', width: 15 },
      { header: 'DIAGNOSTICO', key: 'diagnosis', width: 50 },
      { header: 'TIPO CONTINGENCIA', key: 'contingencyType', width: 25 },
      { header: 'EVOLUCION', key: 'evolution', width: 50 },
      { header: 'DESCRIPCION', key: 'description', width: 50 },
      { header: 'ENVIADO A REVALIDAR', key: 'sentToRevalidate', width: 20 },
      { header: 'DESDE', key: 'fromDate', width: 15 },
      { header: 'HASTA', key: 'toDate', width: 15 },
      { header: 'HORAS', key: 'hours', width: 10 },
      { header: 'DIAS LABORABLES', key: 'workingDays', width: 15 },
      { header: 'DIAS', key: 'days', width: 10 },
      { header: 'EQ. HORAS', key: 'equivalentHours', width: 15 },
      { header: 'ENF. GENERAL', key: 'generalIllness', width: 15 },
      { header: 'ACCIDENTE', key: 'accident', width: 15 },
      { header: 'INSTITUCION EMISORA', key: 'issuingInstitution', width: 30 },
      { header: 'ESPECIALIDAD B', key: 'specialtyB', width: 25 },
      { header: 'MEDICO EMISOR', key: 'issuingDoctor', width: 30 },
      { header: 'SERVICIO C', key: 'serviceC', width: 25 },
      { header: 'CAUSAS', key: 'causes', width: 40 },
      { header: 'DOCUMENTO VALIDO', key: 'validDocument', width: 20 },
      { header: 'DOCUMENTO NO VALIDO', key: 'invalidDocument', width: 20 },
      { header: 'MEDICO D', key: 'doctorD', width: 30 },
      { header: 'PROVIENE DE INCIDENTE/ACCIDENTE', key: 'fromIncidentAccident', width: 30 },
      { header: 'INFO ATENCION MEDICA', key: 'medicalAttentionInfo', width: 80 },
      { header: 'MEDICO', key: 'doctorName', width: 30 },
    ];

    records.forEach(record => {
      const patient = patients.find(p => p.id === record.patientId);
      const doctor = users.find(u => u.id === record.doctorId);

      worksheet.addRow({
        date: record.date,
        identification: record.identification,
        fullName: record.fullName,
        company: record.company,
        workArea: record.workArea,
        position: record.position,
        phone: record.phone || '',
        address: record.address || '',
        clinicalHistory: record.clinicalHistory || '',
        cie10Code: record.cie10Code || '',
        diagnosis: record.diagnosis || '',
        contingencyType: record.contingencyType || '',
        evolution: record.evolution || '',
        description: record.description || '',
        sentToRevalidate: record.sentToRevalidate ? 'SI' : 'NO',
        fromDate: record.fromDate,
        toDate: record.toDate,
        hours: record.hours || 0,
        workingDays: record.workingDays || 0,
        days: record.days || 0,
        equivalentHours: record.equivalentHours || 0,
        generalIllness: record.generalIllness ? 'SI' : 'NO',
        accident: record.accident ? 'SI' : 'NO',
        issuingInstitution: record.issuingInstitution || '',
        specialtyB: record.specialtyB || '',
        issuingDoctor: record.issuingDoctor || '',
        serviceC: record.serviceC || '',
        causes: record.causes || '',
        validDocument: record.validDocument ? 'SI' : 'NO',
        invalidDocument: record.invalidDocument ? 'SI' : 'NO',
        doctorD: record.doctorD || '',
        fromIncidentAccident: record.fromIncidentAccident ? 'SI' : 'NO',
        medicalAttentionInfo: record.medicalAttentionInfo || '',
        doctorName: doctor?.fullName || '',
      });
    });

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Historial_Certificados_Medicos_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
    logger.info(`Historial de certificados médicos exportado: ${records.length} registros`);
  } catch (error: any) {
    logger.error('Error al exportar certificados médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar historial',
      error: error.message,
    });
  }
};




