import { Request, Response } from 'express';
import excelDB from '../utils/excel-database';
import squarenetService from '../utils/squarenet.service';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';

export const createDietRecord = async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).user?.id;
    const { 
      identification, 
      date,
      startDate, 
      endDate, 
      observations,
      cie10Code,
      cie10Description,
      causes,
      secondaryCode,
      secondaryDescription,
      evolution,
      company
    } = req.body;

    logger.info(`Creando registro de dieta para: ${identification}`);

    // Buscar paciente en Excel o crear desde Squarenet
    const patients = await excelDB.getPatients();
    let patient = patients.find(p => p.identification === identification);

    if (!patient) {
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

    // Crear registro con auto-población de datos
    const dietRecord = await excelDB.createDiet({
      patientId: patient.id,
      doctorId,
      date: date || new Date().toISOString().split('T')[0],
      startDate,
      endDate,
      identification: patient.identification,
      fullName: `${patient.firstName} ${patient.lastName}`,
      position: patient.position,
      workArea: patient.workArea,
      phone: patient.phone,
      company: company || patient.company,
      address: patient.address,
      observations: observations || evolution,
      cie10Code,
      cie10Description,
      causes,
      secondaryCode,
      secondaryDescription,
      evolution,
    });

    logger.info(`Registro de dieta creado en Excel: ${dietRecord.id}`);

    res.status(201).json({
      success: true,
      message: 'Registro de dieta/ingreso de alimentos guardado exitosamente',
      data: dietRecord,
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
    const { patientId } = req.query;
    let records = await excelDB.getDietRecords();

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
    logger.error('Error al obtener registros de dieta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros de dieta',
      error: error.message,
    });
  }
};

export const exportDietToExcel = async (req: Request, res: Response) => {
  try {
    logger.info('Exportando registros de dieta/ingreso de alimentos a Excel');
    const records = await excelDB.getDietRecords();
    const patients = await excelDB.getPatients();
    const users = await excelDB.getUsers();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registros de Dieta');

    worksheet.columns = [
      { header: 'FECHA', key: 'date', width: 15 },
      { header: 'CEDULA', key: 'identification', width: 15 },
      { header: 'NOMBRES Y APELLIDOS', key: 'fullName', width: 40 },
      { header: 'EMPRESA', key: 'company', width: 25 },
      { header: 'AREA DE TRABAJO', key: 'workArea', width: 30 },
      { header: 'PUESTO DE TRABAJO', key: 'position', width: 30 },
      { header: 'TELEFONO', key: 'phone', width: 15 },
      { header: 'DIRECCION', key: 'address', width: 50 },
      { header: 'CIE-10', key: 'cie10Code', width: 15 },
      { header: 'DESCRIPCION CIE-10', key: 'cie10Description', width: 50 },
      { header: 'COD. SEC', key: 'secondaryCode', width: 15 },
      { header: 'DESCRIPCION COD.SEC', key: 'secondaryDescription', width: 50 },
      { header: 'CAUSAS', key: 'causes', width: 40 },
      { header: 'EVOLUCION', key: 'evolution', width: 50 },
      { header: 'DESDE', key: 'startDate', width: 15 },
      { header: 'HASTA', key: 'endDate', width: 15 },
      { header: 'OBSERVACIONES', key: 'observations', width: 40 },
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
        cie10Code: record.cie10Code || '',
        cie10Description: record.cie10Description || '',
        secondaryCode: record.secondaryCode || '',
        secondaryDescription: record.secondaryDescription || '',
        causes: record.causes || '',
        evolution: record.evolution || '',
        startDate: record.startDate,
        endDate: record.endDate,
        observations: record.observations || '',
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




