import { Request, Response } from 'express';
import excelDB from '../utils/excel-database';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';

export const createAntidoping = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      date,
      identification,
      fullName,
      position,
      workArea,
      result,
      dopingType,
      observations
    } = req.body;

    logger.info(`Creando registro antidoping para paciente: ${patientId}`);

    const record = await excelDB.createAntidoping({
      patientId,
      date,
      identification,
      fullName,
      position,
      workArea,
      result,
      dopingType,
      observations
    });

    logger.info(`Registro antidoping creado en Excel: ${record.id}`);

    res.status(201).json({
      success: true,
      message: 'Registro de antidoping guardado exitosamente',
      data: record,
    });
  } catch (error: any) {
    logger.error('Error al crear registro antidoping:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear registro antidoping',
      error: error.message,
    });
  }
};

export const getAntidopingRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let records = await excelDB.getAntidopingRecords();

    // Filtrar por paciente si se proporciona
    if (patientId) {
      records = records.filter(r => r.patientId === Number(patientId));
    }

    // Obtener todos los pacientes para enriquecer los registros
    const patients = await excelDB.getPatients();
    const patientsMap = new Map(patients.map(p => [p.id, p]));

    // Enriquecer registros con información del paciente
    const enrichedRecords = records.map(record => {
      const patient = patientsMap.get(record.patientId);
      return {
        ...record,
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
    enrichedRecords.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
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
    logger.error('Error al obtener registros antidoping:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros antidoping',
      error: error.message,
    });
  }
};

export const exportAntidopingToExcel = async (req: Request, res: Response) => {
  try {
    const records = await excelDB.getAntidopingRecords();
    
    // Obtener pacientes para enriquecer datos
    const patients = await excelDB.getPatients();
    const patientsMap = new Map(patients.map(p => [p.id, p]));

    // Enriquecer registros
    const enrichedRecords = records.map(record => {
      const patient = patientsMap.get(record.patientId);
      return {
        ...record,
        patientName: patient ? `${patient.firstName} ${patient.lastName}`.trim() : '',
        company: patient?.company || ''
      };
    });

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Antidoping');

    // Definir columnas
    worksheet.columns = [
      { header: 'FECHA', key: 'date', width: 15 },
      { header: 'CEDULA', key: 'identification', width: 15 },
      { header: 'NOMBRES Y APELLIDOS', key: 'fullName', width: 40 },
      { header: 'AREA DE TRABAJO', key: 'workArea', width: 30 },
      { header: 'RESULTADO', key: 'result', width: 15 },
      { header: 'TIPO DE DOPING', key: 'dopingType', width: 20 },
      { header: 'OBSERVACIONES', key: 'observations', width: 20 },
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
    const formatDate = (dateStr: string): string => {
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
    enrichedRecords.forEach(record => {
      worksheet.addRow({
        date: formatDate(record.date),
        identification: record.identification,
        fullName: record.fullName,
        workArea: record.workArea,
        result: record.result || '',
        dopingType: record.dopingType || '',
        observations: record.observations || ''
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
    res.setHeader('Content-Disposition', `attachment; filename=Historial_Antidoping_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);

    logger.info(`Historial de antidoping exportado: ${enrichedRecords.length} registros`);
  } catch (error: any) {
    logger.error('Error al exportar historial de antidoping:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar historial',
      error: error.message,
    });
  }
};

