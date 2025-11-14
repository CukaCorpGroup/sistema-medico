import { Request, Response } from 'express';
import MedicalRecord from '../models/medical-record.model';
import Patient from '../models/patient.model';
import User from '../models/user.model';
import CIE10 from '../models/cie10.model';
import logger from '../utils/logger';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id;
    const { patientId, date, time, consultType, cie10Code, diagnosis, prescription, daysOfRest, observations } = req.body;

    logger.info(`Creando registro médico para paciente: ${patientId}`);

    // Obtener descripción del CIE-10 si se proporciona código
    let cie10Description = '';
    let causes = '';
    if (cie10Code) {
      const cie10 = await CIE10.findOne({ where: { code: cie10Code } });
      if (cie10) {
        cie10Description = cie10.description;
        // Si la categoría es INCIDENTE o ACCIDENTE, usar esa como causa
        if (cie10.category === 'INCIDENTE' || cie10.category === 'ACCIDENTE') {
          causes = cie10.category;
        } else {
          causes = cie10.description; // Se auto-llena con la descripción para otros casos
        }
      }
    }

    // Calcular contadores de atención
    const currentDate = new Date(date);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Mensual por código: contar atenciones del paciente con este código CIE-10 en el mes actual
    const monthlyCount = await MedicalRecord.count({
      where: {
        patientId,
        cie10Code,
        date: {
          [Op.gte]: new Date(currentYear, currentMonth, 1),
          [Op.lt]: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    });

    // Mensual total: contar todas las atenciones del paciente en el mes actual
    const totalMonthlyCount = await MedicalRecord.count({
      where: {
        patientId,
        date: {
          [Op.gte]: new Date(currentYear, currentMonth, 1),
          [Op.lt]: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    });

    // Anual total: contar todas las atenciones del paciente en el año actual
    const annualCount = await MedicalRecord.count({
      where: {
        patientId,
        date: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lt]: new Date(currentYear + 1, 0, 1),
        },
      },
    });

    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId,
      date,
      time,
      consultType,
      cie10Code,
      cie10Description,
      causes,
      diagnosis,
      prescription,
      daysOfRest: daysOfRest || 0,
      observations,
      monthlyCount: monthlyCount + 1,
      totalMonthlyCount: totalMonthlyCount + 1,
      annualCount: annualCount + 1,
      certificateGenerated: false,
    });

    logger.info(`Registro médico creado: ${medicalRecord.id}`);

    // Cargar relaciones para respuesta
    const recordWithRelations = await MedicalRecord.findByPk(medicalRecord.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Registro de atención médica guardado exitosamente',
      data: recordWithRelations,
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
    const { page = 1, limit = 10, patientId = '', startDate = '', endDate = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (patientId) {
      where.patientId = patientId;
    }
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate as string, endDate as string],
      };
    }

    const { rows: records, count: total } = await MedicalRecord.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
      limit: Number(limit),
      offset,
      order: [['date', 'DESC'], ['time', 'DESC']],
    });

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
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

export const getMedicalRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro médico no encontrado',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    logger.error('Error al obtener registro médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registro médico',
      error: error.message,
    });
  }
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro médico no encontrado',
      });
    }

    await record.update(req.body);

    logger.info(`Registro médico actualizado: ${record.id}`);

    const updatedRecord = await MedicalRecord.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    res.json({
      success: true,
      message: 'Registro médico actualizado exitosamente',
      data: updatedRecord,
    });
  } catch (error: any) {
    logger.error('Error al actualizar registro médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar registro médico',
      error: error.message,
    });
  }
};

export const deleteMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro médico no encontrado',
      });
    }

    await record.destroy();

    logger.info(`Registro médico eliminado: ${id}`);

    res.json({
      success: true,
      message: 'Registro médico eliminado exitosamente',
    });
  } catch (error: any) {
    logger.error('Error al eliminar registro médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar registro médico',
      error: error.message,
    });
  }
};

export const exportMedicalRecordsToExcel = async (req: Request, res: Response) => {
  try {
    logger.info('Exportando registros médicos a Excel');

    const records = await MedicalRecord.findAll({
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
      order: [['date', 'DESC']],
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
      { header: 'AREA DE TRABAJO', key: 'workArea', width: 30 },
      { header: 'PUESTO DE TRABAJO', key: 'position', width: 30 },
      { header: 'TIPO DE CONSULTA', key: 'consultType', width: 25 },
      { header: 'CIE-10', key: 'cie10Code', width: 15 },
      { header: 'DESCRIPCION CIE-10', key: 'cie10Description', width: 50 },
      { header: 'CAUSAS', key: 'causes', width: 40 },
      { header: 'DIAGNOSTICO', key: 'diagnosis', width: 50 },
      { header: 'RECETA', key: 'prescription', width: 50 },
      { header: 'DIAS DE REPOSO', key: 'daysOfRest', width: 15 },
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
    records.forEach((record: any) => {
      worksheet.addRow({
        date: formatDate(record.date),
        time: record.time || '',
        identification: record.patient?.identification || '',
        fullName: record.patient ? `${record.patient.firstName} ${record.patient.lastName}`.trim() : '',
        workArea: record.patient?.workArea || '',
        position: record.patient?.position || '',
        consultType: record.consultType || '',
        cie10Code: record.cie10Code || '',
        cie10Description: record.cie10Description || '',
        causes: record.causes || '',
        diagnosis: record.diagnosis || '',
        prescription: record.prescription || '',
        daysOfRest: record.daysOfRest || 0,
        observations: record.observations || '',
        doctorName: record.doctor?.fullName || ''
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

    logger.info(`Historial de registros médicos exportado: ${records.length} registros`);
  } catch (error: any) {
    logger.error('Error al exportar registros médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar historial',
      error: error.message,
    });
  }
};

