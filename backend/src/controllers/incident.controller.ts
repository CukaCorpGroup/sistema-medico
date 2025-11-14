import { Request, Response } from 'express';
import Incident from '../models/incident.model';
import Patient from '../models/patient.model';
import User from '../models/user.model';
import MedicalRecord from '../models/medical-record.model';
import logger from '../utils/logger';
import { Op } from 'sequelize';

export const createIncident = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id;
    const { medicalRecordId, observations } = req.body;

    logger.info(`Creando incidente desde registro médico: ${medicalRecordId}`);

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

    // Auto-poblar datos desde el registro médico
    const incident = await Incident.create({
      patientId: medicalRecord.patientId,
      doctorId,
      date: new Date(),
      identification: patient.identification,
      fullName: `${patient.firstName} ${patient.lastName}`,
      position: patient.position,
      workArea: patient.workArea,
      company: patient.company,
      address: patient.address,
      phone: patient.phone,
      cie10Code: medicalRecord.cie10Code,
      cie10Description: medicalRecord.cie10Description,
      causes: medicalRecord.causes,
      diagnosis: medicalRecord.diagnosis,
      prescription: medicalRecord.prescription,
      daysOfRest: medicalRecord.daysOfRest,
      observations,
      pdfGenerated: false,
    });

    logger.info(`Incidente creado: ${incident.id}`);

    const incidentWithRelations = await Incident.findByPk(incident.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Incidente registrado exitosamente',
      data: incidentWithRelations,
    });
  } catch (error: any) {
    logger.error('Error al crear incidente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear incidente',
      error: error.message,
    });
  }
};

export const getIncidents = async (req: Request, res: Response) => {
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

    const { rows: incidents, count: total } = await Incident.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
      limit: Number(limit),
      offset,
      order: [['date', 'DESC']],
    });

    res.json({
      success: true,
      data: incidents,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    logger.error('Error al obtener incidentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener incidentes',
      error: error.message,
    });
  }
};

export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incidente no encontrado',
      });
    }

    res.json({
      success: true,
      data: incident,
    });
  } catch (error: any) {
    logger.error('Error al obtener incidente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener incidente',
      error: error.message,
    });
  }
};

export const updateIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByPk(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incidente no encontrado',
      });
    }

    await incident.update(req.body);

    logger.info(`Incidente actualizado: ${incident.id}`);

    const updatedIncident = await Incident.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    res.json({
      success: true,
      message: 'Registro de atención guardado exitosamente',
      data: updatedIncident,
    });
  } catch (error: any) {
    logger.error('Error al actualizar incidente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar incidente',
      error: error.message,
    });
  }
};

export const generateIncidentPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incidente no encontrado',
      });
    }

    // TODO: Implementar generación de PDF con PDFKit
    logger.info(`Generando PDF para incidente: ${id}`);

    res.json({
      success: true,
      message: 'PDF generado exitosamente',
      data: {
        pdfUrl: `/api/v1/incidents/${id}/pdf`,
      },
    });
  } catch (error: any) {
    logger.error('Error al generar PDF de incidente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
      error: error.message,
    });
  }
};

export const exportIncidentsToExcel = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Fechas de inicio y fin son requeridas',
      });
    }

    logger.info(`Exportando incidentes a Excel: ${startDate} - ${endDate}`);

    const incidents = await Incident.findAll({
      where: {
        date: {
          [Op.between]: [startDate as string, endDate as string],
        },
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'doctor', attributes: { exclude: ['password'] } },
      ],
      order: [['date', 'ASC']],
    });

    // TODO: Implementar exportación a Excel con ExcelJS
    res.json({
      success: true,
      message: 'Incidentes obtenidos para exportación',
      data: incidents,
    });
  } catch (error: any) {
    logger.error('Error al exportar incidentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar incidentes',
      error: error.message,
    });
  }
};

