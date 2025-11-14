import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import logger from './logger';

// Directorio donde se guardarán los archivos Excel
const DATA_DIR = path.join(__dirname, '../../data');

// Asegurar que el directorio exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: 'admin' | 'doctor' | 'reader';
  isActive: boolean;
  mustChangePassword: boolean;
}

interface Patient {
  id: number;
  identification: string;
  firstName: string;
  lastName: string;
  position: string;
  workArea: string;
  gender: string;
  phone?: string;
  company: string;
  address?: string;
  email?: string;
  disability?: string;
  vulnerable?: string;
  vulnerableDescription?: string;
  vulnerableReversible?: boolean;
}

interface CIE10 {
  id: number;
  code: string;
  description: string;
  category?: string;
  isActive: boolean;
}

interface Vulnerability {
  id: number;
  code: string;
  description: string;
  category?: string;
  isActive: boolean;
}

interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  consultType: string;
  cie10Code?: string;
  cie10Description?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  causes?: string;
  finalStatus?: string;
  diagnosis: string;
  prescription?: string;
  daysOfRest?: number;
  observations?: string;
  monthlyCount?: number;
  totalMonthlyCount?: number;
  annualCount?: number;
  certificateGenerated: boolean;
}

interface Incident {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  company: string;
  phone?: string;
  address?: string;
  cie10Code?: string;
  cie10Description?: string;
  causes?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  diagnosis: string;
  prescription?: string;
  condition?: string;
  daysOfRest?: number;
  observations?: string;
  pdfGenerated: boolean;
}

interface Antidoping {
  id: number;
  patientId: number;
  date: string;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  result?: string;
  dopingType?: string;
  observations?: string;
}

interface Gloves {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  phone?: string;
  company: string;
  address?: string;
  cie10Code?: string;
  cie10Description?: string;
  causes?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  evolution?: string;
  startDate: string;
  endDate: string;
  observations?: string;
}

interface Diet {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  phone?: string;
  company: string;
  address?: string;
  cie10Code?: string;
  cie10Description?: string;
  causes?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  evolution?: string;
  startDate: string;
  endDate: string;
  observations?: string;
}

interface Certificate {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  phone?: string;
  company: string;
  address?: string;
  clinicalHistory?: string;
  cie10Code?: string;
  diagnosis?: string;
  contingencyType?: string;
  evolution?: string;
  description?: string;
  sentToRevalidate: boolean;
  fromDate: string;
  toDate: string;
  hours?: number;
  workingDays?: number;
  days?: number;
  equivalentHours?: number;
  generalIllness: boolean;
  accident: boolean;
  issuingInstitution?: string;
  specialtyB?: string;
  issuingDoctor?: string;
  serviceC?: string;
  causes?: string;
  validDocument: boolean;
  invalidDocument: boolean;
  doctorD?: string;
  fromIncidentAccident: boolean;
  medicalAttentionInfo?: string;
}

class ExcelDatabase {
  private workbooks: Map<string, ExcelJS.Workbook> = new Map();

  private async getWorkbook(filename: string): Promise<ExcelJS.Workbook> {
    const filePath = path.join(DATA_DIR, filename);

    if (this.workbooks.has(filename)) {
      return this.workbooks.get(filename)!;
    }

    const workbook = new ExcelJS.Workbook();

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
    } else {
      // Crear nuevo archivo
      const worksheet = workbook.addWorksheet('Datos');
      await workbook.xlsx.writeFile(filePath);
    }

    this.workbooks.set(filename, workbook);
    return workbook;
  }

  private async saveWorkbook(filename: string): Promise<void> {
    const filePath = path.join(DATA_DIR, filename);
    const workbook = this.workbooks.get(filename);
    if (workbook) {
      await workbook.xlsx.writeFile(filePath);
    }
  }

  // USUARIOS
  async getUsers(): Promise<User[]> {
    const workbook = await this.getWorkbook('usuarios.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const users: User[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        users.push({
          id: Number(row.getCell(1).value),
          username: String(row.getCell(2).value || ''),
          password: String(row.getCell(3).value || ''),
          fullName: String(row.getCell(4).value || ''),
          email: String(row.getCell(5).value || ''),
          role: String(row.getCell(6).value || 'doctor') as any,
          isActive: Boolean(row.getCell(7).value),
          mustChangePassword: Boolean(row.getCell(8).value),
        });
      }
    });

    return users;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.username === username) || null;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const workbook = await this.getWorkbook('usuarios.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Usuario', key: 'username', width: 20 },
        { header: 'Contraseña', key: 'password', width: 60 },
        { header: 'Nombre Completo', key: 'fullName', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Rol', key: 'role', width: 15 },
        { header: 'Activo', key: 'isActive', width: 10 },
        { header: 'Cambiar Contraseña', key: 'mustChangePassword', width: 20 },
      ];
    }

    const users = await this.getUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const newUser: User = {
      id: newId,
      ...user,
      password: hashedPassword,
    };

    worksheet.addRow([
      newUser.id,
      newUser.username,
      newUser.password,
      newUser.fullName,
      newUser.email,
      newUser.role,
      newUser.isActive,
      newUser.mustChangePassword,
    ]);

    await this.saveWorkbook('usuarios.xlsx');
    logger.info(`Usuario creado en Excel: ${newUser.username}`);

    return newUser;
  }

  // PACIENTES
  async getPatients(): Promise<Patient[]> {
    const workbook = await this.getWorkbook('pacientes.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const patients: Patient[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        patients.push({
          id: Number(row.getCell(1).value),
          identification: String(row.getCell(2).value || ''),
          firstName: String(row.getCell(3).value || ''),
          lastName: String(row.getCell(4).value || ''),
          position: String(row.getCell(5).value || ''),
          workArea: String(row.getCell(6).value || ''),
          gender: String(row.getCell(7).value || ''),
          phone: String(row.getCell(8).value || ''),
          company: String(row.getCell(9).value || ''),
          address: String(row.getCell(10).value || ''),
          email: String(row.getCell(11).value || ''),
          disability: String(row.getCell(12).value || ''),
          vulnerable: String(row.getCell(13).value || ''),
          vulnerableDescription: String(row.getCell(14).value || ''),
          vulnerableReversible: row.getCell(15).value === true || row.getCell(15).value === 'TRUE' || row.getCell(15).value === 'Si' || row.getCell(15).value === 'SI',
        });
      }
    });

    return patients;
  }

  async findPatientByIdentification(identification: string): Promise<Patient | null> {
    const patients = await this.getPatients();
    return patients.find(p => p.identification === identification) || null;
  }

  async createPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    const workbook = await this.getWorkbook('pacientes.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Identificación', key: 'identification', width: 15 },
        { header: 'Nombres', key: 'firstName', width: 25 },
        { header: 'Apellidos', key: 'lastName', width: 25 },
        { header: 'Puesto', key: 'position', width: 25 },
        { header: 'Área de Trabajo', key: 'workArea', width: 25 },
        { header: 'Género', key: 'gender', width: 15 },
        { header: 'Teléfono', key: 'phone', width: 15 },
        { header: 'Empresa', key: 'company', width: 25 },
        { header: 'Dirección', key: 'address', width: 35 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Discapacidad', key: 'disability', width: 15 },
        { header: 'Vulnerable', key: 'vulnerable', width: 15 },
        { header: 'Descripción Vulnerabilidad', key: 'vulnerableDescription', width: 50 },
        { header: 'Vulnerabilidad Reversible', key: 'vulnerableReversible', width: 20 },
      ];
    }

    const patients = await this.getPatients();
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;

    const newPatient: Patient = { id: newId, ...patient };

    worksheet.addRow([
      newPatient.id,
      newPatient.identification,
      newPatient.firstName,
      newPatient.lastName,
      newPatient.position,
      newPatient.workArea,
      newPatient.gender,
      newPatient.phone,
      newPatient.company,
      newPatient.address,
      newPatient.email,
      newPatient.disability || '',
      newPatient.vulnerable || '',
      newPatient.vulnerableDescription || '',
      newPatient.vulnerableReversible || false,
    ]);

    await this.saveWorkbook('pacientes.xlsx');
    logger.info(`Paciente creado en Excel: ${newPatient.identification}`);

    return newPatient;
  }

  async updatePatient(id: number, updates: Partial<Patient>): Promise<Patient> {
    const workbook = await this.getWorkbook('pacientes.xlsx');
    const worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      throw new Error('No se encontró la hoja de datos de pacientes');
    }

    // Buscar la fila del paciente
    let patientRow: ExcelJS.Row | null = null;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && Number(row.getCell(1).value) === id) {
        patientRow = row;
      }
    });

    if (!patientRow) {
      throw new Error(`Paciente con ID ${id} no encontrado`);
    }

    // Actualizar los campos (usar type assertion para que TypeScript reconozca el tipo)
    const row: ExcelJS.Row = patientRow;
    if (updates.firstName !== undefined) row.getCell(3).value = updates.firstName;
    if (updates.lastName !== undefined) row.getCell(4).value = updates.lastName;
    if (updates.position !== undefined) row.getCell(5).value = updates.position;
    if (updates.workArea !== undefined) row.getCell(6).value = updates.workArea;
    if (updates.gender !== undefined) row.getCell(7).value = updates.gender;
    if (updates.phone !== undefined) row.getCell(8).value = updates.phone;
    if (updates.company !== undefined) row.getCell(9).value = updates.company;
    if (updates.address !== undefined) row.getCell(10).value = updates.address;
    if (updates.email !== undefined) row.getCell(11).value = updates.email;
    if (updates.disability !== undefined) row.getCell(12).value = updates.disability;
    if (updates.vulnerable !== undefined) row.getCell(13).value = updates.vulnerable;
    if (updates.vulnerableDescription !== undefined) row.getCell(14).value = updates.vulnerableDescription;
    if (updates.vulnerableReversible !== undefined) row.getCell(15).value = updates.vulnerableReversible;

    await this.saveWorkbook('pacientes.xlsx');
    
    // Retornar el paciente actualizado
    const patients = await this.getPatients();
    const updatedPatient = patients.find(p => p.id === id);
    
    if (!updatedPatient) {
      throw new Error(`Error al obtener paciente actualizado con ID ${id}`);
    }

    logger.info(`Paciente actualizado en Excel: ${updatedPatient.identification}`);
    return updatedPatient;
  }

  // CÓDIGOS CIE-10
  async getCIE10Codes(): Promise<CIE10[]> {
    const workbook = await this.getWorkbook('cie10.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const codes: CIE10[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        codes.push({
          id: Number(row.getCell(1).value),
          code: String(row.getCell(2).value || ''),
          description: String(row.getCell(3).value || ''),
          category: String(row.getCell(4).value || ''),
          isActive: Boolean(row.getCell(5).value),
        });
      }
    });

    return codes;
  }

  async searchCIE10(query: string): Promise<CIE10[]> {
    const codes = await this.getCIE10Codes();
    const lowerQuery = query.toLowerCase();
    return codes.filter(
      c =>
        c.isActive &&
        (c.code.toLowerCase().includes(lowerQuery) ||
          c.description.toLowerCase().includes(lowerQuery))
    );
  }

  async createCIE10(code: Omit<CIE10, 'id'>): Promise<CIE10> {
    const workbook = await this.getWorkbook('cie10.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'code', width: 15 },
        { header: 'Descripción', key: 'description', width: 60 },
        { header: 'Categoría', key: 'category', width: 30 },
        { header: 'Activo', key: 'isActive', width: 10 },
      ];
    }

    const codes = await this.getCIE10Codes();
    const newId = codes.length > 0 ? Math.max(...codes.map(c => c.id)) + 1 : 1;

    const newCode: CIE10 = { id: newId, ...code };

    worksheet.addRow([newCode.id, newCode.code, newCode.description, newCode.category, newCode.isActive]);

    await this.saveWorkbook('cie10.xlsx');
    return newCode;
  }

  // VULNERABILIDADES
  async getVulnerabilities(): Promise<Vulnerability[]> {
    const workbook = await this.getWorkbook('vulnerabilidades.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    // Si no existe la hoja, crearla con datos de ejemplo
    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'code', width: 15 },
        { header: 'Descripción', key: 'description', width: 60 },
        { header: 'Categoría', key: 'category', width: 30 },
        { header: 'Activo', key: 'isActive', width: 10 },
      ];
      // Agregar encabezados como primera fila
      worksheet.addRow(['ID', 'Código', 'Descripción', 'Categoría', 'Activo']);
      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      
      // Agregar vulnerabilidades de ejemplo
      const exampleVulnerabilities = [
        { id: 1, code: 'VULN001', description: 'DIABETES', category: 'Enfermedad Crónica', isActive: true },
        { id: 2, code: 'VULN002', description: 'EMBARAZO', category: 'Condición Temporal', isActive: true },
        { id: 3, code: 'VULN003', description: 'HIPERTENSIÓN', category: 'Enfermedad Crónica', isActive: true },
        { id: 4, code: 'VULN004', description: 'ASMA', category: 'Enfermedad Crónica', isActive: true },
        { id: 5, code: 'VULN005', description: 'ENFERMEDAD CARDÍACA', category: 'Enfermedad Crónica', isActive: true },
      ];
      
      exampleVulnerabilities.forEach(vuln => {
        worksheet!.addRow([vuln.id, vuln.code, vuln.description, vuln.category, vuln.isActive]);
      });
      
      await this.saveWorkbook('vulnerabilidades.xlsx');
    }

    // Asegurar que worksheet no es undefined después del bloque if
    if (!worksheet) {
      throw new Error('No se pudo crear o acceder a la hoja de vulnerabilidades');
    }

    const vulnerabilities: Vulnerability[] = [];
    worksheet.eachRow((row, rowNumber) => {
      // Saltar la primera fila si contiene encabezados
      if (rowNumber > 1) {
        const idValue = row.getCell(1).value;
        // Solo procesar si hay un ID válido (número)
        if (idValue !== null && idValue !== undefined && idValue !== '' && !isNaN(Number(idValue))) {
          vulnerabilities.push({
            id: Number(idValue),
            code: String(row.getCell(2).value || ''),
            description: String(row.getCell(3).value || ''),
            category: String(row.getCell(4).value || ''),
            isActive: Boolean(row.getCell(5).value),
          });
        }
      }
    });

    return vulnerabilities;
  }

  async searchVulnerabilities(query: string): Promise<Vulnerability[]> {
    const vulnerabilities = await this.getVulnerabilities();
    const lowerQuery = query.toLowerCase();
    return vulnerabilities.filter(
      v =>
        v.isActive &&
        (v.code.toLowerCase().includes(lowerQuery) ||
          v.description.toLowerCase().includes(lowerQuery))
    );
  }

  async createVulnerability(vulnerability: Omit<Vulnerability, 'id'>): Promise<Vulnerability> {
    // Asegurarse de que el archivo existe con datos de ejemplo si está vacío
    await this.getVulnerabilities();
    
    const workbook = await this.getWorkbook('vulnerabilidades.xlsx');
    const worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      throw new Error('No se pudo crear o acceder a la hoja de vulnerabilidades');
    }

    const vulnerabilities = await this.getVulnerabilities();
    const newId = vulnerabilities.length > 0 ? Math.max(...vulnerabilities.map(v => v.id)) + 1 : 1;

    const newVulnerability: Vulnerability = { id: newId, ...vulnerability };

    worksheet.addRow([newVulnerability.id, newVulnerability.code, newVulnerability.description, newVulnerability.category, newVulnerability.isActive]);

    await this.saveWorkbook('vulnerabilidades.xlsx');
    return newVulnerability;
  }

  // REGISTROS MÉDICOS
  async getMedicalRecords(): Promise<MedicalRecord[]> {
    const workbook = await this.getWorkbook('registros-medicos.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const records: MedicalRecord[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        records.push({
          id: Number(row.getCell(1).value),
          patientId: Number(row.getCell(2).value),
          doctorId: Number(row.getCell(3).value),
          date: String(row.getCell(4).value || ''),
          time: String(row.getCell(5).value || ''),
          consultType: String(row.getCell(6).value || ''),
          cie10Code: String(row.getCell(7).value || ''),
          cie10Description: String(row.getCell(8).value || ''),
          secondaryCode: String(row.getCell(9).value || ''),
          secondaryDescription: String(row.getCell(10).value || ''),
          causes: String(row.getCell(11).value || ''),
          finalStatus: String(row.getCell(12).value || ''),
          diagnosis: String(row.getCell(13).value || ''),
          prescription: String(row.getCell(14).value || ''),
          daysOfRest: Number(row.getCell(15).value) || 0,
          observations: String(row.getCell(16).value || ''),
          monthlyCount: Number(row.getCell(17).value) || 0,
          totalMonthlyCount: Number(row.getCell(18).value) || 0,
          annualCount: Number(row.getCell(19).value) || 0,
          certificateGenerated: Boolean(row.getCell(20).value),
        });
      }
    });

    return records;
  }

  async createMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
    const workbook = await this.getWorkbook('registros-medicos.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'ID Paciente', key: 'patientId', width: 12 },
        { header: 'ID Doctor', key: 'doctorId', width: 12 },
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Hora', key: 'time', width: 10 },
        { header: 'Tipo Consulta', key: 'consultType', width: 25 },
        { header: 'Código CIE-10', key: 'cie10Code', width: 15 },
        { header: 'Descripción CIE-10', key: 'cie10Description', width: 50 },
        { header: 'Código Secundario', key: 'secondaryCode', width: 15 },
        { header: 'Descripción Secundaria', key: 'secondaryDescription', width: 50 },
        { header: 'Causas', key: 'causes', width: 50 },
        { header: 'Estado Final', key: 'finalStatus', width: 15 },
        { header: 'Diagnóstico', key: 'diagnosis', width: 80 },
        { header: 'Receta', key: 'prescription', width: 80 },
        { header: 'Días de Reposo', key: 'daysOfRest', width: 15 },
        { header: 'Observaciones', key: 'observations', width: 50 },
        { header: 'Contador Mensual por Código', key: 'monthlyCount', width: 25 },
        { header: 'Contador Mensual Total', key: 'totalMonthlyCount', width: 25 },
        { header: 'Contador Anual', key: 'annualCount', width: 20 },
        { header: 'Certificado Generado', key: 'certificateGenerated', width: 20 },
      ];
    }

    const records = await this.getMedicalRecords();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;

    const newRecord: MedicalRecord = { id: newId, ...record };

    worksheet.addRow([
      newRecord.id,
      newRecord.patientId,
      newRecord.doctorId,
      newRecord.date,
      newRecord.time,
      newRecord.consultType,
      newRecord.cie10Code,
      newRecord.cie10Description,
      newRecord.secondaryCode,
      newRecord.secondaryDescription,
      newRecord.causes,
      newRecord.finalStatus || '',
      newRecord.diagnosis,
      newRecord.prescription,
      newRecord.daysOfRest,
      newRecord.observations,
      newRecord.monthlyCount,
      newRecord.totalMonthlyCount,
      newRecord.annualCount,
      newRecord.certificateGenerated,
    ]);

    await this.saveWorkbook('registros-medicos.xlsx');
    logger.info(`Registro médico creado en Excel: ${newRecord.id}`);

    return newRecord;
  }

  // INCIDENTES
  async getIncidents(): Promise<Incident[]> {
    const workbook = await this.getWorkbook('incidentes.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const incidents: Incident[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        incidents.push({
          id: Number(row.getCell(1).value),
          patientId: Number(row.getCell(2).value),
          doctorId: Number(row.getCell(3).value),
          date: String(row.getCell(4).value || ''),
          identification: String(row.getCell(5).value || ''),
          fullName: String(row.getCell(6).value || ''),
          position: String(row.getCell(7).value || ''),
          workArea: String(row.getCell(8).value || ''),
          company: String(row.getCell(9).value || ''),
          phone: String(row.getCell(10).value || ''),
          address: String(row.getCell(11).value || ''),
          cie10Code: String(row.getCell(12).value || ''),
          cie10Description: String(row.getCell(13).value || ''),
          causes: String(row.getCell(14).value || ''),
          secondaryCode: String(row.getCell(15).value || ''),
          secondaryDescription: String(row.getCell(16).value || ''),
          diagnosis: String(row.getCell(17).value || ''),
          prescription: String(row.getCell(18).value || ''),
          condition: String(row.getCell(19).value || ''),
          daysOfRest: Number(row.getCell(20).value) || 0,
          observations: String(row.getCell(21).value || ''),
          pdfGenerated: Boolean(row.getCell(22).value),
        });
      }
    });

    return incidents;
  }

  async createIncident(incident: Omit<Incident, 'id'>): Promise<Incident> {
    const workbook = await this.getWorkbook('incidentes.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'ID Paciente', key: 'patientId', width: 12 },
        { header: 'ID Doctor', key: 'doctorId', width: 12 },
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Identificación', key: 'identification', width: 15 },
        { header: 'Nombre Completo', key: 'fullName', width: 40 },
        { header: 'Puesto', key: 'position', width: 30 },
        { header: 'Área de Trabajo', key: 'workArea', width: 30 },
        { header: 'Empresa', key: 'company', width: 25 },
        { header: 'Teléfono', key: 'phone', width: 15 },
        { header: 'Dirección', key: 'address', width: 50 },
        { header: 'Código CIE-10', key: 'cie10Code', width: 15 },
        { header: 'Descripción CIE-10', key: 'cie10Description', width: 50 },
        { header: 'Causas', key: 'causes', width: 50 },
        { header: 'Código Secundario', key: 'secondaryCode', width: 15 },
        { header: 'Descripción Secundaria', key: 'secondaryDescription', width: 50 },
        { header: 'Evolución', key: 'diagnosis', width: 80 },
        { header: 'Prescripción', key: 'prescription', width: 80 },
        { header: 'Condición', key: 'condition', width: 20 },
        { header: 'Días de Reposo', key: 'daysOfRest', width: 15 },
        { header: 'Observaciones', key: 'observations', width: 50 },
        { header: 'PDF Generado', key: 'pdfGenerated', width: 15 },
      ];
    }

    const incidents = await this.getIncidents();
    const newId = incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 1;

    const newIncident: Incident = { id: newId, ...incident };

    worksheet.addRow([
      newIncident.id,
      newIncident.patientId,
      newIncident.doctorId,
      newIncident.date,
      newIncident.identification,
      newIncident.fullName,
      newIncident.position,
      newIncident.workArea,
      newIncident.company,
      newIncident.phone || '',
      newIncident.address || '',
      newIncident.cie10Code || '',
      newIncident.cie10Description || '',
      newIncident.causes || '',
      newIncident.secondaryCode || '',
      newIncident.secondaryDescription || '',
      newIncident.diagnosis,
      newIncident.prescription || '',
      newIncident.condition || '',
      newIncident.daysOfRest || 0,
      newIncident.observations || '',
      newIncident.pdfGenerated || false,
    ]);

    await this.saveWorkbook('incidentes.xlsx');
    logger.info(`Incidente creado en Excel: ${newIncident.id}`);

    return newIncident;
  }

  // ANTIDOPING
  async getAntidopingRecords(): Promise<Antidoping[]> {
    const workbook = await this.getWorkbook('antidoping.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const records: Antidoping[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        records.push({
          id: Number(row.getCell(1).value),
          patientId: Number(row.getCell(2).value),
          date: String(row.getCell(3).value || ''),
          identification: String(row.getCell(4).value || ''),
          fullName: String(row.getCell(5).value || ''),
          position: String(row.getCell(6).value || ''),
          workArea: String(row.getCell(7).value || ''),
          result: String(row.getCell(8).value || ''),
          dopingType: String(row.getCell(9).value || ''),
          observations: String(row.getCell(10).value || ''),
        });
      }
    });

    return records;
  }

  async createAntidoping(record: Omit<Antidoping, 'id'>): Promise<Antidoping> {
    const workbook = await this.getWorkbook('antidoping.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'ID Paciente', key: 'patientId', width: 12 },
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Identificación', key: 'identification', width: 15 },
        { header: 'Nombre Completo', key: 'fullName', width: 40 },
        { header: 'Puesto', key: 'position', width: 30 },
        { header: 'Área de Trabajo', key: 'workArea', width: 30 },
        { header: 'Resultado', key: 'result', width: 20 },
        { header: 'Tipo de Doping', key: 'dopingType', width: 20 },
        { header: 'Observaciones', key: 'observations', width: 20 },
      ];
    }

    const records = await this.getAntidopingRecords();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;

    const newRecord: Antidoping = { id: newId, ...record };

    worksheet.addRow([
      newRecord.id,
      newRecord.patientId,
      newRecord.date,
      newRecord.identification,
      newRecord.fullName,
      newRecord.position,
      newRecord.workArea,
      newRecord.result || '',
      newRecord.dopingType || '',
      newRecord.observations || '',
    ]);

    await this.saveWorkbook('antidoping.xlsx');
    logger.info(`Registro antidoping creado en Excel: ${newRecord.id}`);

    return newRecord;
  }

  // GUANTES
  async getGlovesRecords(): Promise<Gloves[]> {
    const workbook = await this.getWorkbook('guantes.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const records: Gloves[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        records.push({
          id: Number(row.getCell(1).value),
          patientId: Number(row.getCell(2).value),
          doctorId: Number(row.getCell(3).value),
          date: String(row.getCell(4).value || ''),
          identification: String(row.getCell(5).value || ''),
          fullName: String(row.getCell(6).value || ''),
          position: String(row.getCell(7).value || ''),
          workArea: String(row.getCell(8).value || ''),
          phone: String(row.getCell(9).value || ''),
          company: String(row.getCell(10).value || ''),
          address: String(row.getCell(11).value || ''),
          cie10Code: String(row.getCell(12).value || ''),
          cie10Description: String(row.getCell(13).value || ''),
          causes: String(row.getCell(14).value || ''),
          secondaryCode: String(row.getCell(15).value || ''),
          secondaryDescription: String(row.getCell(16).value || ''),
          evolution: String(row.getCell(17).value || ''),
          startDate: String(row.getCell(18).value || ''),
          endDate: String(row.getCell(19).value || ''),
          observations: String(row.getCell(20).value || ''),
        });
      }
    });

    return records;
  }

  async createGloves(record: Omit<Gloves, 'id'>): Promise<Gloves> {
    const workbook = await this.getWorkbook('guantes.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      // Agregar encabezados como primera fila
      worksheet.addRow([
        'ID',
        'ID Paciente',
        'ID Doctor',
        'Fecha',
        'Identificación',
        'Nombre Completo',
        'Puesto',
        'Área de Trabajo',
        'Teléfono',
        'Empresa',
        'Dirección',
        'Código CIE-10',
        'Descripción CIE-10',
        'Causas',
        'Código Secundario',
        'Descripción Secundaria',
        'Evolución',
        'Fecha Desde',
        'Fecha Hasta',
        'Observaciones',
      ]);
      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    const records = await this.getGlovesRecords();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;

    const newRecord: Gloves = { id: newId, ...record };

    worksheet.addRow([
      newRecord.id,
      newRecord.patientId,
      newRecord.doctorId,
      newRecord.date,
      newRecord.identification,
      newRecord.fullName,
      newRecord.position,
      newRecord.workArea,
      newRecord.phone || '',
      newRecord.company,
      newRecord.address || '',
      newRecord.cie10Code || '',
      newRecord.cie10Description || '',
      newRecord.causes || '',
      newRecord.secondaryCode || '',
      newRecord.secondaryDescription || '',
      newRecord.evolution || '',
      newRecord.startDate,
      newRecord.endDate,
      newRecord.observations || '',
    ]);

    await this.saveWorkbook('guantes.xlsx');
    logger.info(`Registro de guantes creado en Excel: ${newRecord.id}`);

    return newRecord;
  }

  // DIETA
  async getDietRecords(): Promise<Diet[]> {
    // Forzar recarga del workbook para obtener datos actualizados
    const filePath = path.join(DATA_DIR, 'dieta.xlsx');
    const workbook = new ExcelJS.Workbook();
    
    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
    }
    
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const records: Diet[] = [];
    let rowCount = 0;
    
    worksheet.eachRow((row, rowNumber) => {
      rowCount++;
      // Saltar la primera fila si contiene encabezados
      if (rowNumber > 1) {
        const idValue = row.getCell(1).value;
        // Solo procesar si hay un ID válido (número)
        if (idValue !== null && idValue !== undefined && idValue !== '' && !isNaN(Number(idValue))) {
          try {
            records.push({
              id: Number(idValue),
              patientId: Number(row.getCell(2).value) || 0,
              doctorId: Number(row.getCell(3).value) || 0,
              date: String(row.getCell(4).value || ''),
              identification: String(row.getCell(5).value || ''),
              fullName: String(row.getCell(6).value || ''),
              position: String(row.getCell(7).value || ''),
              workArea: String(row.getCell(8).value || ''),
              phone: String(row.getCell(9).value || ''),
              company: String(row.getCell(10).value || ''),
              address: String(row.getCell(11).value || ''),
              cie10Code: String(row.getCell(12).value || ''),
              cie10Description: String(row.getCell(13).value || ''),
              causes: String(row.getCell(14).value || ''),
              secondaryCode: String(row.getCell(15).value || ''),
              secondaryDescription: String(row.getCell(16).value || ''),
              evolution: String(row.getCell(17).value || ''),
              startDate: String(row.getCell(18).value || ''),
              endDate: String(row.getCell(19).value || ''),
              observations: String(row.getCell(20).value || ''),
            });
          } catch (error) {
            logger.warn(`Error procesando fila ${rowNumber} de dieta:`, error);
          }
        }
      }
    });

    logger.info(`Lectura de registros de dieta: ${records.length} registros encontrados de ${rowCount} filas totales`);
    return records;
  }

  async createDiet(record: Omit<Diet, 'id'>): Promise<Diet> {
    const workbook = await this.getWorkbook('dieta.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      // Agregar encabezados como primera fila
      worksheet.addRow([
        'ID',
        'ID Paciente',
        'ID Doctor',
        'Fecha',
        'Identificación',
        'Nombre Completo',
        'Puesto',
        'Área de Trabajo',
        'Teléfono',
        'Empresa',
        'Dirección',
        'Código CIE-10',
        'Descripción CIE-10',
        'Causas',
        'Código Secundario',
        'Descripción Secundaria',
        'Evolución',
        'Fecha Desde',
        'Fecha Hasta',
        'Observaciones',
      ]);
      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    const records = await this.getDietRecords();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;

    const newRecord: Diet = { id: newId, ...record };

    worksheet.addRow([
      newRecord.id,
      newRecord.patientId,
      newRecord.doctorId,
      newRecord.date,
      newRecord.identification,
      newRecord.fullName,
      newRecord.position,
      newRecord.workArea,
      newRecord.phone || '',
      newRecord.company,
      newRecord.address || '',
      newRecord.cie10Code || '',
      newRecord.cie10Description || '',
      newRecord.causes || '',
      newRecord.secondaryCode || '',
      newRecord.secondaryDescription || '',
      newRecord.evolution || '',
      newRecord.startDate,
      newRecord.endDate,
      newRecord.observations || '',
    ]);

    await this.saveWorkbook('dieta.xlsx');
    logger.info(`Registro de dieta creado en Excel: ${newRecord.id}`);

    return newRecord;
  }

  // CERTIFICADOS
  async getCertificates(): Promise<Certificate[]> {
    const workbook = await this.getWorkbook('certificados.xlsx');
    const worksheet = workbook.getWorksheet('Datos') || workbook.addWorksheet('Datos');

    const records: Certificate[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        records.push({
          id: Number(row.getCell(1).value),
          patientId: Number(row.getCell(2).value),
          doctorId: Number(row.getCell(3).value),
          date: String(row.getCell(4).value || ''),
          identification: String(row.getCell(5).value || ''),
          fullName: String(row.getCell(6).value || ''),
          position: String(row.getCell(7).value || ''),
          workArea: String(row.getCell(8).value || ''),
          phone: String(row.getCell(9).value || ''),
          company: String(row.getCell(10).value || ''),
          address: String(row.getCell(11).value || ''),
          clinicalHistory: String(row.getCell(12).value || ''),
          cie10Code: String(row.getCell(13).value || ''),
          diagnosis: String(row.getCell(14).value || ''),
          contingencyType: String(row.getCell(15).value || ''),
          evolution: String(row.getCell(16).value || ''),
          description: String(row.getCell(17).value || ''),
          sentToRevalidate: Boolean(row.getCell(18).value),
          fromDate: String(row.getCell(19).value || ''),
          toDate: String(row.getCell(20).value || ''),
          hours: Number(row.getCell(21).value) || 0,
          workingDays: Number(row.getCell(22).value) || 0,
          days: Number(row.getCell(23).value) || 0,
          equivalentHours: Number(row.getCell(24).value) || 0,
          generalIllness: Boolean(row.getCell(25).value),
          accident: Boolean(row.getCell(26).value),
          issuingInstitution: String(row.getCell(27).value || ''),
          specialtyB: String(row.getCell(28).value || ''),
          issuingDoctor: String(row.getCell(29).value || ''),
          serviceC: String(row.getCell(30).value || ''),
          causes: String(row.getCell(31).value || ''),
          validDocument: Boolean(row.getCell(32).value),
          invalidDocument: Boolean(row.getCell(33).value),
          doctorD: String(row.getCell(34).value || ''),
          fromIncidentAccident: Boolean(row.getCell(35).value),
          medicalAttentionInfo: String(row.getCell(36).value || ''),
        });
      }
    });

    return records;
  }

  async createCertificate(record: Omit<Certificate, 'id'>): Promise<Certificate> {
    const workbook = await this.getWorkbook('certificados.xlsx');
    let worksheet = workbook.getWorksheet('Datos');

    if (!worksheet) {
      worksheet = workbook.addWorksheet('Datos');
      // Agregar encabezados como primera fila
      worksheet.addRow([
        'ID',
        'ID Paciente',
        'ID Doctor',
        'Fecha',
        'Identificación',
        'Nombre Completo',
        'Puesto',
        'Área de Trabajo',
        'Teléfono',
        'Empresa',
        'Dirección',
        'Historia Clínica',
        'Código CIE-10',
        'Diagnóstico',
        'Tipo Contingencia',
        'Evolución',
        'Descripción',
        'Enviado a Revalidar',
        'Fecha Desde',
        'Fecha Hasta',
        'Horas',
        'Días Laborables',
        'Días',
        'EQ. Horas',
        'ENF. GENERAL',
        'ACCIDENTE',
        'Institución Emisora',
        'Especialidad B',
        'Médico Emisor',
        'Servicio C',
        'Causas',
        'Documento Válido',
        'Documento No Válido',
        'Médico D',
        'Proviene de Incidente/Accidente',
        'Info Atención Médica',
      ]);
      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    const records = await this.getCertificates();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;

    const newRecord: Certificate = { id: newId, ...record };

    worksheet.addRow([
      newRecord.id,
      newRecord.patientId,
      newRecord.doctorId,
      newRecord.date,
      newRecord.identification,
      newRecord.fullName,
      newRecord.position,
      newRecord.workArea,
      newRecord.phone || '',
      newRecord.company,
      newRecord.address || '',
      newRecord.clinicalHistory || '',
      newRecord.cie10Code || '',
      newRecord.diagnosis || '',
      newRecord.contingencyType || '',
      newRecord.evolution || '',
      newRecord.description || '',
      newRecord.sentToRevalidate || false,
      newRecord.fromDate,
      newRecord.toDate,
      newRecord.hours || 0,
      newRecord.workingDays || 0,
      newRecord.days || 0,
      newRecord.equivalentHours || 0,
      newRecord.generalIllness || false,
      newRecord.accident || false,
      newRecord.issuingInstitution || '',
      newRecord.specialtyB || '',
      newRecord.issuingDoctor || '',
      newRecord.serviceC || '',
      newRecord.causes || '',
      newRecord.validDocument || false,
      newRecord.invalidDocument || false,
      newRecord.doctorD || '',
      newRecord.fromIncidentAccident || false,
      newRecord.medicalAttentionInfo || '',
    ]);

    await this.saveWorkbook('certificados.xlsx');
    logger.info(`Certificado creado en Excel: ${newRecord.id}`);

    return newRecord;
  }
}

// Exportar instancia singleton
export default new ExcelDatabase();


