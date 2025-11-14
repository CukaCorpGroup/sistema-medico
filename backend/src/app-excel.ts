import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes-excel';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './utils/logger';
import excelDB from './utils/excel-database';
import squarenetService from './utils/squarenet.service';
import { ensureDirectories } from './utils/ensure-directories';
import { connectDatabase } from './config/database';
import './models'; // Inicializar modelos Sequelize

dotenv.config();

// Asegurar que existan los directorios necesarios
ensureDirectories();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar límite de tasa
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, intente más tarde',
});

// Middlewares generales
app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200', 
  credentials: true 
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Portal de atención médica Marbelize S.A. - API (Excel Mode)',
    version: '1.0.0',
    status: 'running',
    storage: 'Excel Files',
  });
});

// Health check
app.get('/api/v1/health', async (req, res) => {
  const squarenetHealth = await squarenetService.healthCheck();
  
  res.json({
    success: true,
    message: 'API en funcionamiento',
    timestamp: new Date().toISOString(),
    storage: 'Excel Files (archivos .xlsx)',
    services: {
      squarenet: squarenetHealth ? 'connected' : 'disconnected',
    },
  });
});

// Montar todas las rutas de la API
app.use('/api/v1', routes);

// Manejadores de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Función para iniciar servidor
const startServer = async () => {
  try {
    logger.info('🚀 Iniciando servidor con almacenamiento en EXCEL...');

    // Conectar a base de datos PostgreSQL para módulos que la requieren (certificados, guantes, dieta)
    try {
      await connectDatabase();
      logger.info('✓ Base de datos PostgreSQL conectada (para certificados, guantes y dieta)');
    } catch (error: any) {
      logger.warn('⚠ No se pudo conectar a PostgreSQL. Los módulos de certificados, guantes y dieta pueden no funcionar correctamente.');
      logger.warn('⚠ Error:', error.message);
    }

    // Inicializar datos de ejemplo si no existen
    const users = await excelDB.getUsers();
    if (users.length === 0) {
      logger.info('Creando usuarios iniciales...');
      await excelDB.createUser({
        username: 'admin',
        password: 'admin123',
        fullName: 'Dr. Administrador Sistema',
        email: 'admin@marbelize.com',
        role: 'admin',
        isActive: true,
        mustChangePassword: false,
      });
      await excelDB.createUser({
        username: 'doctor1',
        password: 'doctor123',
        fullName: 'Dr. Juan Pérez Médico',
        email: 'doctor1@marbelize.com',
        role: 'doctor',
        isActive: true,
        mustChangePassword: true,
      });
      logger.info('✓ Usuarios creados');
    }

    // Crear códigos CIE-10 iniciales
    const cie10Codes = await excelDB.getCIE10Codes();
    if (cie10Codes.length === 0) {
      logger.info('Creando códigos CIE-10 iniciales...');
      const initialCodes = [
        { code: 'A09', description: 'Diarrea y gastroenteritis de presunto origen infeccioso', category: 'Enfermedades infecciosas intestinales', isActive: true },
        { code: 'J00', description: 'Rinofaringitis aguda [resfriado común]', category: 'Infecciones respiratorias agudas', isActive: true },
        { code: 'J02', description: 'Faringitis aguda', category: 'Infecciones respiratorias agudas', isActive: true },
        { code: 'J03', description: 'Amigdalitis aguda', category: 'Infecciones respiratorias agudas', isActive: true },
        { code: 'J06', description: 'Infecciones agudas de las vías respiratorias superiores', category: 'Infecciones respiratorias agudas', isActive: true },
        { code: 'J11', description: 'Gripe, virus no identificado', category: 'Gripe y neumonía', isActive: true },
        { code: 'K29', description: 'Gastritis y duodenitis', category: 'Enfermedades del sistema digestivo', isActive: true },
        { code: 'M54', description: 'Dorsalgia', category: 'Enfermedades del sistema musculoesquelético', isActive: true },
        { code: 'R50', description: 'Fiebre de origen desconocido', category: 'Síntomas y signos generales', isActive: true },
        { code: 'R51', description: 'Cefalea', category: 'Síntomas y signos generales', isActive: true },
        { code: 'R10', description: 'Dolor abdominal y pélvico', category: 'Síntomas y signos generales', isActive: true },
        { code: 'S60', description: 'Traumatismo superficial de la muñeca y de la mano', category: 'Traumatismos de la muñeca y de la mano', isActive: true },
        { code: 'T14', description: 'Traumatismo de región no especificada del cuerpo', category: 'Traumatismos múltiples', isActive: true },
        { code: 'Z00', description: 'Examen general e investigación de personas sin quejas o sin diagnóstico informado', category: 'Personas en contacto con los servicios de salud', isActive: true },
      ];
      
      for (const code of initialCodes) {
        await excelDB.createCIE10(code);
      }
      logger.info('✓ Códigos CIE-10 creados');
    }

    // Verificar conexión con Squarenet
    const squarenetStatus = await squarenetService.healthCheck();
    if (squarenetStatus) {
      logger.info('✓ Squarenet conectado exitosamente');
    } else {
      logger.warn('⚠ Squarenet no disponible (modo mock activado)');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║  Portal de atención médica Marbelize S.A.   ║
║  ✅ Servidor iniciado exitosamente           ║
║                                              ║
║  🚀 Puerto: ${PORT}                              
║  🔗 URL: http://localhost:${PORT}               
║  📊 Health: http://localhost:${PORT}/api/v1/health
║  📁 Almacenamiento: Archivos EXCEL           ║
║  📂 Ubicación: backend/data/*.xlsx           ║
║  🔗 Squarenet: ${squarenetStatus ? 'Conectado' : 'Desconectado'}             ║
╚══════════════════════════════════════════════╝
      `);
      logger.info('Servidor iniciado correctamente con almacenamiento en EXCEL');
      logger.info('Archivos Excel ubicados en: backend/data/');
    });
  } catch (error) {
    logger.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;

