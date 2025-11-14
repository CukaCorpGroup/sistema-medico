import { connectDatabase } from '../config/database';
import User from '../models/user.model';
import CIE10 from '../models/cie10.model';
import logger from './logger';

// Datos iniciales de usuarios
const initialUsers = [
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'Dr. Administrador Sistema',
    email: 'admin@marbelize.com',
    role: 'admin' as const,
    isActive: true,
    mustChangePassword: false,
  },
  {
    username: 'doctor1',
    password: 'doctor123',
    fullName: 'Dr. Juan Pérez Médico',
    email: 'doctor1@marbelize.com',
    role: 'doctor' as const,
    isActive: true,
    mustChangePassword: true,
  },
  {
    username: 'lector1',
    password: 'lector123',
    fullName: 'María García Lectora',
    email: 'lector1@marbelize.com',
    role: 'reader' as const,
    isActive: true,
    mustChangePassword: true,
  },
];

// Códigos CIE-10 más comunes (muestra)
const initialCIE10Codes = [
  { code: 'A00', description: 'Cólera', category: 'Enfermedades infecciosas intestinales' },
  { code: 'A09', description: 'Diarrea y gastroenteritis de presunto origen infeccioso', category: 'Enfermedades infecciosas intestinales' },
  { code: 'J00', description: 'Rinofaringitis aguda [resfriado común]', category: 'Infecciones respiratorias agudas' },
  { code: 'J02', description: 'Faringitis aguda', category: 'Infecciones respiratorias agudas' },
  { code: 'J03', description: 'Amigdalitis aguda', category: 'Infecciones respiratorias agudas' },
  { code: 'J06', description: 'Infecciones agudas de las vías respiratorias superiores', category: 'Infecciones respiratorias agudas' },
  { code: 'J11', description: 'Gripe, virus no identificado', category: 'Gripe y neumonía' },
  { code: 'J18', description: 'Neumonía, organismo no especificado', category: 'Gripe y neumonía' },
  { code: 'K29', description: 'Gastritis y duodenitis', category: 'Enfermedades del sistema digestivo' },
  { code: 'K30', description: 'Dispepsia', category: 'Enfermedades del sistema digestivo' },
  { code: 'K59', description: 'Otros trastornos funcionales del intestino', category: 'Enfermedades del sistema digestivo' },
  { code: 'M25', description: 'Otros trastornos articulares', category: 'Enfermedades del sistema musculoesquelético' },
  { code: 'M54', description: 'Dorsalgia', category: 'Enfermedades del sistema musculoesquelético' },
  { code: 'M79', description: 'Otros trastornos de los tejidos blandos', category: 'Enfermedades del sistema musculoesquelético' },
  { code: 'R50', description: 'Fiebre de origen desconocido', category: 'Síntomas y signos generales' },
  { code: 'R51', description: 'Cefalea', category: 'Síntomas y signos generales' },
  { code: 'R10', description: 'Dolor abdominal y pélvico', category: 'Síntomas y signos generales' },
  { code: 'S00', description: 'Traumatismo superficial de la cabeza', category: 'Traumatismos de la cabeza' },
  { code: 'S50', description: 'Traumatismo superficial del antebrazo', category: 'Traumatismos del codo y del antebrazo' },
  { code: 'S60', description: 'Traumatismo superficial de la muñeca y de la mano', category: 'Traumatismos de la muñeca y de la mano' },
  { code: 'T14', description: 'Traumatismo de región no especificada del cuerpo', category: 'Traumatismos múltiples' },
  { code: 'Z00', description: 'Examen general e investigación de personas sin quejas o sin diagnóstico informado', category: 'Personas en contacto con los servicios de salud' },
  { code: 'Z02', description: 'Examen y contacto para fines administrativos', category: 'Personas en contacto con los servicios de salud' },
  // Códigos CIE-10 para incidentes laborales
  { code: 'S20', description: 'Traumatismo superficial del tórax - INCIDENTE LABORAL', category: 'INCIDENTE' },
  { code: 'S40', description: 'Traumatismo superficial del hombro y del brazo - INCIDENTE LABORAL', category: 'INCIDENTE' },
  // Códigos CIE-10 para accidentes laborales
  { code: 'S72', description: 'Fractura del fémur - ACCIDENTE LABORAL', category: 'ACCIDENTE' },
  { code: 'S82', description: 'Fractura de la pierna, incluido el tobillo - ACCIDENTE LABORAL', category: 'ACCIDENTE' },
];

export const seedDatabase = async () => {
  try {
    logger.info('Iniciando semilla de base de datos...');

    // Conectar a base de datos
    await connectDatabase();

    // Crear usuarios si no existen
    logger.info('Creando usuarios iniciales...');
    for (const userData of initialUsers) {
      const existingUser = await User.findOne({ where: { username: userData.username } });
      if (!existingUser) {
        await User.create(userData);
        logger.info(`Usuario creado: ${userData.username}`);
      } else {
        logger.info(`Usuario ya existe: ${userData.username}`);
      }
    }

    // Crear códigos CIE-10 si no existen
    logger.info('Creando códigos CIE-10 iniciales...');
    for (const cie10Data of initialCIE10Codes) {
      const existingCode = await CIE10.findOne({ where: { code: cie10Data.code } });
      if (!existingCode) {
        await CIE10.create({ ...cie10Data, isActive: true });
        logger.info(`Código CIE-10 creado: ${cie10Data.code}`);
      } else {
        logger.info(`Código CIE-10 ya existe: ${cie10Data.code}`);
      }
    }

    logger.info('✓ Semilla de base de datos completada exitosamente');
    logger.info('\n=== Credenciales de Acceso ===');
    logger.info('Administrador:');
    logger.info('  Usuario: admin | Contraseña: admin123');
    logger.info('Doctor:');
    logger.info('  Usuario: doctor1 | Contraseña: doctor123');
    logger.info('Lector:');
    logger.info('  Usuario: lector1 | Contraseña: lector123');
    logger.info('===============================\n');

    process.exit(0);
  } catch (error) {
    logger.error('Error al sembrar base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;



