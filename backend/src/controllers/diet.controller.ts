import { Request, Response } from 'express';
import Diet from '../models/diet.model';
import Patient from '../models/patient.model';
import User from '../models/user.model';
import squarenetService from '../utils/squarenet.service';
import logger from '../utils/logger';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

export const createDietRecord = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id;
    const { 
      identification, 
      startDate, 
      endDate, 
      observations,
      cie10Code,
      cie10Description,
      causes,
      secondaryCode,
      secondaryDescription,
      evolution
    } = req.body;

    logger.info(`Creando registro de dieta para: ${identification}`);

    // Buscar paciente o crear desde Squarenet
    let patient = await Patient.findOne({ where: { identification } });

    if (!patient) {
      try {
        const employeeData = await squarenetService.searchEmployeeByIdentification(identification);
        
        if (employeeData) {
          patient = await Patient.create({
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
        } else {
          return res.status(404).json({
            success: false,
            message: 'Empleado no encontrado en nómina activa',
          });
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Error al buscar empleado en sistema de nómina',
        });
      }
    }

    // Crear registro con auto-población de datos de Squarenet
    const dietRecord = await Diet.create({
      patientId: patient.id,
      doctorId,
      startDate,
      endDate,
      identification: patient.identification,
      fullName: `${patient.firstName} ${patient.lastName}`,
      position: patient.position,
      workArea: patient.workArea,
      phone: patient.phone,
      company: patient.company,
      address: patient.address,
      observations: observations || evolution,
      cie10Code,
      cie10Description,
      causes,
      secondaryCode,
      secondaryDescription,
      evolution,
    });

    logger.info(`Registro de dieta creado: ${dietRecord.id}`);

    const recordWithRelations = await Diet.findByPk(dietRecord.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Registro de dieta guardado exitosamente',
      data: recordWithRelations,
    });
  } catch (error: any) {
    logger.error('Error al crear registro de dieta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear registro de dieta',
      error: error.message,
    });
  }
};

export const getDietRecords = async (req: Request, res: Response) => {
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

    const { rows: records, count: total } = await Diet.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
      limit: Number(limit),
      offset,
      order: [['startDate', 'DESC']],
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
    logger.error('Error al obtener registros de dieta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros de dieta',
      error: error.message,
    });
  }
};

export const getDietRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Diet.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro de dieta no encontrado',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    logger.error('Error al obtener registro de dieta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registro de dieta',
      error: error.message,
    });
  }
};

export const updateDietRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Diet.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro de dieta no encontrado',
      });
    }

    await record.update(req.body);

    logger.info(`Registro de dieta actualizado: ${record.id}`);

    const updatedRecord = await Diet.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    res.json({
      success: true,
      message: 'Registro actualizado exitosamente',
      data: updatedRecord,
    });
  } catch (error: any) {
    logger.error('Error al actualizar registro de dieta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar registro de dieta',
      error: error.message,
    });
  }
};

export const exportDietToExcel = async (req: Request, res: Response) => {
  try {
    logger.info('Exportando registros de dieta/ingreso de alimentos a Excel');

    let records: any[] = [];
    try {
      records = await Diet.findAll({
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
        ],
        order: [['startDate', 'DESC']],
      });
    } catch (dbError: any) {
      logger.warn('Error al acceder a base de datos PostgreSQL:', dbError.message);
      // Continuar con array vacío si no hay conexión a PostgreSQL
      records = [];
    }

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Dieta/Ingreso Alimentos');

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
      { header: 'COD. SEC', key: 'secondaryCode', width: 15 },
      { header: 'DESC. COD. SEC', key: 'secondaryDescription', width: 50 },
      { header: 'CAUSAS', key: 'causes', width: 40 },
      { header: 'EVOLUCION', key: 'evolution', width: 50 },
      { header: 'DESDE', key: 'startDate', width: 15 },
      { header: 'HASTA', key: 'endDate', width: 15 },
      { header: 'OBSERVACIONES', key: 'observations', width: 50 },
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
        date: formatDate(record.createdAt),
        identification: record.identification || '',
        fullName: record.fullName || '',
        workArea: record.workArea || '',
        position: record.position || '',
        company: record.company || '',
        cie10Code: record.cie10Code || '',
        cie10Description: record.cie10Description || '',
        secondaryCode: record.secondaryCode || '',
        secondaryDescription: record.secondaryDescription || '',
        causes: record.causes || '',
        evolution: record.evolution || '',
        startDate: formatDate(record.startDate),
        endDate: formatDate(record.endDate),
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
    res.setHeader('Content-Disposition', `attachment; filename=Historial_Dieta_Ingreso_Alimentos_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);

    logger.info(`Historial de dieta/ingreso de alimentos exportado: ${records.length} registros`);
  } catch (error: any) {
    logger.error('Error al exportar registros de dieta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar historial',
      error: error.message,
    });
  }
};

