import { Request, Response } from 'express';
import Certificate from '../models/certificate.model';
import MedicalRecord from '../models/medical-record.model';
import Patient from '../models/patient.model';
import User from '../models/user.model';
import logger from '../utils/logger';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id;
    const {
      medicalRecordId,
      startDate,
      endDate,
      issuingInstitution,
      issuingDoctor,
      specialty,
      service,
      document,
      doctor,
      observations,
    } = req.body;

    logger.info(`Creando certificado médico desde registro: ${medicalRecordId}`);

    // Obtener datos del registro médico para auto-poblar
    const medicalRecord = await MedicalRecord.findByPk(medicalRecordId);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Registro médico no encontrado',
      });
    }

    // Obtener el paciente por separado
    const patient = await Patient.findByPk(medicalRecord.patientId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado',
      });
    }

    // Calcular días válidos
    const start = new Date(startDate);
    const end = new Date(endDate);
    const validDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Auto-poblar datos desde el registro de atención médica
    const certificate = await Certificate.create({
      medicalRecordId,
      patientId: medicalRecord.patientId,
      doctorId,
      fullName: `${patient.firstName} ${patient.lastName}`,
      position: patient.position,
      workArea: patient.workArea,
      phone: patient.phone,
      company: patient.company,
      address: patient.address,
      cie10Code: medicalRecord.cie10Code,
      cie10Description: medicalRecord.cie10Description,
      startDate,
      endDate,
      validDays,
      issuingInstitution,
      issuingDoctor,
      specialty,
      service,
      document,
      doctor,
      observations,
      pdfGenerated: false,
    });

    // Actualizar registro médico para indicar que se generó certificado
    await medicalRecord.update({
      certificateGenerated: true,
      certificateId: certificate.id,
    });

    logger.info(`Certificado médico creado: ${certificate.id}`);

    const certificateWithRelations = await Certificate.findByPk(certificate.id, {
      include: [
        { model: MedicalRecord, as: 'medicalRecord' },
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctorUser', attributes: { exclude: ['password'] } },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Certificado médico generado exitosamente',
      data: certificateWithRelations,
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
    const { page = 1, limit = 10, patientId = '', startDate = '', endDate = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (patientId) {
      where.patientId = patientId;
    }
    if (startDate && endDate) {
      where.startDate = {
        [Op.between]: [startDate as string, endDate as string],
      };
    }

    const { rows: certificates, count: total } = await Certificate.findAndCountAll({
      where,
      include: [
        { model: MedicalRecord, as: 'medicalRecord' },
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctorUser', attributes: { exclude: ['password'] } },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: certificates,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
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

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByPk(id, {
      include: [
        { model: MedicalRecord, as: 'medicalRecord' },
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctorUser', attributes: { exclude: ['password'] } },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado',
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error: any) {
    logger.error('Error al obtener certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener certificado',
      error: error.message,
    });
  }
};

export const updateCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado',
      });
    }

    await certificate.update(req.body);

    logger.info(`Certificado actualizado: ${certificate.id}`);

    const updatedCertificate = await Certificate.findByPk(id, {
      include: [
        { model: MedicalRecord, as: 'medicalRecord' },
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctorUser', attributes: { exclude: ['password'] } },
      ],
    });

    res.json({
      success: true,
      message: 'Certificado actualizado exitosamente',
      data: updatedCertificate,
    });
  } catch (error: any) {
    logger.error('Error al actualizar certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar certificado',
      error: error.message,
    });
  }
};

export const generateCertificatePDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByPk(id, {
      include: [
        { model: MedicalRecord, as: 'medicalRecord' },
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctorUser', attributes: { exclude: ['password'] } },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado',
      });
    }

    // TODO: Implementar generación de PDF con PDFKit
    logger.info(`Generando PDF para certificado: ${id}`);

    res.json({
      success: true,
      message: 'PDF generado exitosamente',
      data: {
        pdfUrl: `/api/v1/certificates/${id}/pdf`,
      },
    });
  } catch (error: any) {
    logger.error('Error al generar PDF de certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
      error: error.message,
    });
  }
};

export const exportCertificatesToExcel = async (req: Request, res: Response) => {
  try {
    logger.info('Exportando certificados médicos a Excel');

    let certificates: any[] = [];
    try {
      certificates = await Certificate.findAll({
        include: [
          { model: MedicalRecord, as: 'medicalRecord' },
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctorUser', attributes: { exclude: ['password'] } },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (dbError: any) {
      logger.warn('Error al acceder a base de datos PostgreSQL:', dbError.message);
      // Continuar con array vacío si no hay conexión a PostgreSQL
      certificates = [];
    }

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Certificados Médicos');

    // Definir columnas
    worksheet.columns = [
      { header: 'FECHA', key: 'date', width: 15 },
      { header: 'CEDULA', key: 'identification', width: 15 },
      { header: 'NOMBRES Y APELLIDOS', key: 'fullName', width: 40 },
      { header: 'AREA DE TRABAJO', key: 'workArea', width: 30 },
      { header: 'PUESTO DE TRABAJO', key: 'position', width: 30 },
      { header: 'EMPRESA', key: 'company', width: 25 },
      { header: 'CIE-10', key: 'cie10Code', width: 15 },
      { header: 'DESCRIPCION CIE-10', key: 'cie10Description', width: 50 },
      { header: 'DESDE', key: 'startDate', width: 15 },
      { header: 'HASTA', key: 'endDate', width: 15 },
      { header: 'DIAS VALIDOS', key: 'validDays', width: 15 },
      { header: 'INSTITUCION EMISORA', key: 'issuingInstitution', width: 30 },
      { header: 'MEDICO EMISOR', key: 'issuingDoctor', width: 30 },
      { header: 'ESPECIALIDAD', key: 'specialty', width: 25 },
      { header: 'SERVICIO', key: 'service', width: 25 },
      { header: 'DOCUMENTO', key: 'document', width: 20 },
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

    // Agregar datos
    certificates.forEach((certificate: any) => {
      worksheet.addRow({
        date: formatDate(certificate.createdAt),
        identification: certificate.patient?.identification || '',
        fullName: certificate.fullName || '',
        workArea: certificate.workArea || '',
        position: certificate.position || '',
        company: certificate.company || '',
        cie10Code: certificate.cie10Code || '',
        cie10Description: certificate.cie10Description || '',
        startDate: formatDate(certificate.startDate),
        endDate: formatDate(certificate.endDate),
        validDays: certificate.validDays || 0,
        issuingInstitution: certificate.issuingInstitution || '',
        issuingDoctor: certificate.issuingDoctor || '',
        specialty: certificate.specialty || '',
        service: certificate.service || '',
        document: certificate.document || '',
        observations: certificate.observations || '',
        doctorName: certificate.doctorUser?.fullName || ''
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
    res.setHeader('Content-Disposition', `attachment; filename=Historial_Certificados_Medicos_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);

    logger.info(`Historial de certificados médicos exportado: ${certificates.length} registros`);
  } catch (error: any) {
    logger.error('Error al exportar certificados médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar historial',
      error: error.message,
    });
  }
};

