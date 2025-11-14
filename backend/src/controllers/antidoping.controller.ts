import { Request, Response } from 'express';
import Antidoping from '../models/antidoping.model';
import Patient from '../models/patient.model';
import squarenetService from '../utils/squarenet.service';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export const createAntidoping = async (req: Request, res: Response) => {
  try {
    const { identification, date, verification, observations, evaluation } = req.body;

    logger.info(`Creando registro antidopaje para: ${identification}`);

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
    const antidoping = await Antidoping.create({
      patientId: patient.id,
      date,
      identification: patient.identification,
      fullName: `${patient.firstName} ${patient.lastName}`,
      position: patient.position,
      workArea: patient.workArea,
      verification,
      observations,
      evaluation,
    });

    logger.info(`Registro antidopaje creado: ${antidoping.id}`);

    const recordWithRelations = await Antidoping.findByPk(antidoping.id, {
      include: [{ model: Patient, as: 'patient' }],
    });

    res.status(201).json({
      success: true,
      message: 'Prueba antidopaje registrada exitosamente',
      data: recordWithRelations,
    });
  } catch (error: any) {
    logger.error('Error al crear registro antidopaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear registro antidopaje',
      error: error.message,
    });
  }
};

export const getAntidopingRecords = async (req: Request, res: Response) => {
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

    const { rows: records, count: total } = await Antidoping.findAndCountAll({
      where,
      include: [{ model: Patient, as: 'patient' }],
      limit: Number(limit),
      offset,
      order: [['date', 'DESC']],
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
    logger.error('Error al obtener registros antidopaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros antidopaje',
      error: error.message,
    });
  }
};

export const getAntidopingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Antidoping.findByPk(id, {
      include: [{ model: Patient, as: 'patient' }],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro antidopaje no encontrado',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    logger.error('Error al obtener registro antidopaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registro antidopaje',
      error: error.message,
    });
  }
};

export const updateAntidoping = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Antidoping.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro antidopaje no encontrado',
      });
    }

    await record.update(req.body);

    logger.info(`Registro antidopaje actualizado: ${record.id}`);

    const updatedRecord = await Antidoping.findByPk(id, {
      include: [{ model: Patient, as: 'patient' }],
    });

    res.json({
      success: true,
      message: 'Registro actualizado exitosamente',
      data: updatedRecord,
    });
  } catch (error: any) {
    logger.error('Error al actualizar registro antidopaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar registro antidopaje',
      error: error.message,
    });
  }
};

export const exportAntidopingToExcel = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Fechas de inicio y fin son requeridas',
      });
    }

    logger.info(`Exportando registros antidopaje a Excel: ${startDate} - ${endDate}`);

    const records = await Antidoping.findAll({
      where: {
        date: {
          [Op.between]: [startDate as string, endDate as string],
        },
      },
      include: [{ model: Patient, as: 'patient' }],
      order: [['date', 'ASC']],
    });

    // TODO: Implementar exportación a Excel con ExcelJS
    res.json({
      success: true,
      message: 'Registros obtenidos para exportación',
      data: records,
    });
  } catch (error: any) {
    logger.error('Error al exportar registros antidopaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar registros antidopaje',
      error: error.message,
    });
  }
};

