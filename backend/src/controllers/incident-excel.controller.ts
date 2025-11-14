import { Request, Response } from 'express';
import excelDB from '../utils/excel-database';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';

export const createIncident = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id || 1;
    const {
      patientId,
      date,
      identification,
      fullName,
      position,
      workArea,
      company,
      phone,
      address,
      cie10Code,
      cie10Description,
      causes,
      secondaryCode,
      secondaryDescription,
      diagnosis,
      prescription,
      condition,
      daysOfRest,
      observations
    } = req.body;

    logger.info(`Creando incidente para paciente: ${patientId}`);

    const incident = await excelDB.createIncident({
      patientId,
      doctorId,
      date,
      identification,
      fullName,
      position,
      workArea,
      company,
      phone,
      address,
      cie10Code,
      cie10Description,
      causes,
      secondaryCode,
      secondaryDescription,
      diagnosis,
      prescription,
      condition,
      daysOfRest: daysOfRest || 0,
      observations,
      pdfGenerated: false,
    });

    logger.info(`Incidente creado en Excel: ${incident.id}`);

    res.status(201).json({
      success: true,
      message: 'Incidente registrado exitosamente',
      data: incident,
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
    const { patientId } = req.query;
    let incidents = await excelDB.getIncidents();

    // Filtrar por paciente si se proporciona
    if (patientId) {
      incidents = incidents.filter(i => i.patientId === Number(patientId));
    }

    // Obtener todos los pacientes para enriquecer los registros
    const patients = await excelDB.getPatients();
    const patientsMap = new Map(patients.map(p => [p.id, p]));

    // Enriquecer incidentes con información del paciente
    const enrichedIncidents = incidents.map(incident => {
      const patient = patientsMap.get(incident.patientId);
      return {
        ...incident,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          fullName: `${patient.firstName} ${patient.lastName}`.trim(),
          identification: patient.identification
        } : null
      };
    });

    // Ordenar por fecha descendente
    enrichedIncidents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    res.json({
      success: true,
      data: enrichedIncidents,
      pagination: {
        total: enrichedIncidents.length,
        page: 1,
        limit: enrichedIncidents.length,
        totalPages: 1,
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

export const exportIncidentsToExcel = async (req: Request, res: Response) => {
  try {
    // Obtener todos los incidentes
    let incidents = await excelDB.getIncidents();
    const patients = await excelDB.getPatients();
    const patientsMap = new Map(patients.map(p => [p.id, p]));

    // Obtener usuarios/doctores
    const users = await excelDB.getUsers();
    const usersMap = new Map(users.map(u => [u.id, u]));

    // Enriquecer incidentes
    const enrichedIncidents = incidents.map(incident => {
      const patient = patientsMap.get(incident.patientId);
      const doctor = usersMap.get(incident.doctorId);
      return {
        ...incident,
        doctorName: doctor ? (doctor.fullName || `DR. ${doctor.username}`.toUpperCase()) : 'N/A',
        patientInfo: patient
      };
    });

    // Ordenar por fecha descendente
    enrichedIncidents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registro Incidentes');

    // Definir columnas según la imagen
    worksheet.columns = [
      { header: 'FECHA', key: 'date', width: 12 },
      { header: 'MEDICO', key: 'doctor', width: 20 },
      { header: 'CEDULA', key: 'identification', width: 15 },
      { header: 'APELLIDOS Y NOMBRES', key: 'fullName', width: 35 },
      { header: 'EMPRESA', key: 'company', width: 15 },
      { header: 'AREA', key: 'workArea', width: 15 },
      { header: 'CIE-10', key: 'cie10', width: 12 },
      { header: 'DIAGNOSTICO', key: 'diagnosis', width: 30 },
      { header: 'CIE-2', key: 'cie2', width: 12 },
      { header: 'DETALLE CIE-2', key: 'cie2Detail', width: 30 },
      { header: 'EVOLUCION', key: 'evolution', width: 60 },
      { header: 'DIAS DE REPOSO', key: 'daysOfRest', width: 15 },
    ];

    // Estilo para el encabezado
    worksheet.getRow(1).font = { bold: true, size: 11 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Formatear fecha helper
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return dateStr;
      }
    };

    // Agregar datos
    enrichedIncidents.forEach(incident => {
      // DIAGNOSTICO: descripción breve (CIE-10 description o causas)
      const diagnosis = incident.cie10Description || incident.causes || '';
      // EVOLUCION: campo de evolución completa
      const evolution = incident.diagnosis || '';
      
      worksheet.addRow({
        date: formatDate(incident.date),
        doctor: incident.doctorName || 'N/A',
        identification: incident.identification || '',
        fullName: incident.fullName || '',
        company: incident.company || 'Marbelize',
        workArea: incident.workArea || '',
        cie10: incident.cie10Code || '',
        diagnosis: diagnosis,
        cie2: incident.secondaryCode || '',
        cie2Detail: incident.secondaryDescription || '',
        evolution: evolution,
        daysOfRest: incident.daysOfRest || ''
      });

      // Aplicar estilo alternado a las filas
      const rowNumber = worksheet.rowCount;
      if (rowNumber % 2 === 0) {
        const row = worksheet.getRow(rowNumber);
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
      }
    });

    // Ajustar alineación de celdas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.alignment = { vertical: 'top', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    // Generar buffer del Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Establecer headers para descarga
    const filename = `Registro_Incidentes_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    logger.info(`Excel de incidentes generado: ${filename}`);

    res.send(buffer);
  } catch (error: any) {
    logger.error('Error al exportar incidentes a Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar incidentes a Excel',
      error: error.message,
    });
  }
};

