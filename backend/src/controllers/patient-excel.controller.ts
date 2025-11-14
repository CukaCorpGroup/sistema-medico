import { Request, Response } from 'express';
import excelDB from '../utils/excel-database';
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

    // Primero buscar en Excel
    let patient = await excelDB.findPatientByIdentification(identification as string);

    // Buscar en Squarenet para obtener datos actualizados (incluyendo discapacidad y vulnerable)
    try {
      const employeeData = await squarenetService.searchEmployeeByIdentification(
        identification as string
      );

        if (employeeData) {
          if (!patient) {
          // Crear paciente desde datos de Squarenet (incluyendo discapacidad y vulnerable)
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
            disability: employeeData.disabilityDescription || employeeData.disability || 'NO',
            vulnerable: employeeData.vulnerable || 'NO',
            vulnerableDescription: employeeData.vulnerableDescription || '',
            vulnerableReversible: false,
          });

            logger.info(`Paciente creado desde Squarenet en Excel: ${patient.id}`);
          } else {
            // Actualizar paciente existente con datos de Squarenet (especialmente discapacidad y vulnerable)
            const updatedPatient = await excelDB.updatePatient(patient.id, {
              disability: employeeData.disabilityDescription || employeeData.disability || patient.disability || 'NO',
              vulnerable: employeeData.vulnerable || patient.vulnerable || 'NO',
              vulnerableDescription: employeeData.vulnerableDescription || patient.vulnerableDescription || '',
              vulnerableReversible: patient.vulnerableReversible || false,
              // También actualizar otros campos si han cambiado
              firstName: employeeData.firstName || patient.firstName,
              lastName: employeeData.lastName || patient.lastName,
              position: employeeData.position || patient.position,
              workArea: employeeData.workArea || patient.workArea,
              gender: employeeData.gender || patient.gender,
              phone: employeeData.phone || patient.phone,
              email: employeeData.email || patient.email,
              company: employeeData.company || patient.company,
              address: employeeData.address || patient.address,
            });

            patient = updatedPatient;
            logger.info(`Paciente actualizado desde Squarenet: ${updatedPatient.id}`);
          }
        }
    } catch (error: any) {
      logger.error('Error al buscar en Squarenet:', error);
      // Si hay error pero el paciente existe en Excel, retornarlo igual
      if (!patient) {
        // Solo lanzar error si no hay paciente en Excel ni en Squarenet
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
    const patients = await excelDB.getPatients();
    
    res.json({
      success: true,
      data: patients,
      pagination: {
        total: patients.length,
        page: 1,
        limit: patients.length,
        totalPages: 1,
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



