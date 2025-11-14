import { Request, Response } from 'express';
import Patient from '../models/patient.model';
import squarenetService from '../utils/squarenet.service';
import logger from '../utils/logger';

export const searchPatient = async (req: Request, res: Response) => {
  try {
    const { identification } = req.query;

    if (!identification) {
      return res.status(400).json({
        success: false,
        message: 'Identificación requerida',
      });
    }

    logger.info(`Buscando paciente con identificación: ${identification}`);

    // Primero buscar en base de datos local
    let patient = await Patient.findOne({
      where: { identification: identification as string },
    });

    // Si no existe localmente, buscar en Squarenet
    if (!patient) {
      logger.info('Paciente no encontrado localmente, buscando en Squarenet');
      
      try {
        const employeeData = await squarenetService.searchEmployeeByIdentification(
          identification as string
        );

        if (employeeData) {
          // Crear paciente desde datos de Squarenet
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

          logger.info(`Paciente creado desde Squarenet: ${patient.id}`);
        }
      } catch (error: any) {
        logger.error('Error al buscar en Squarenet:', error);
        // Continuar aunque falle Squarenet
      }
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado en el sistema ni en nómina activa',
      });
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    logger.error('Error al buscar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar paciente',
      error: error.message,
    });
  }
};

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { identification: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: patients, count: total } = await Patient.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: patients,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    logger.error('Error al obtener pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message,
    });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.create(req.body);

    logger.info(`Paciente creado: ${patient.id}`);

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: patient,
    });
  } catch (error: any) {
    logger.error('Error al crear paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear paciente',
      error: error.message,
    });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado',
      });
    }

    await patient.update(req.body);

    logger.info(`Paciente actualizado: ${patient.id}`);

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: patient,
    });
  } catch (error: any) {
    logger.error('Error al actualizar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente',
      error: error.message,
    });
  }
};



