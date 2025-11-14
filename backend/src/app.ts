import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './utils/logger';
import squarenetService from './utils/squarenet.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar límite de tasa
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por IP
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
    message: 'Portal de atención médica Marbelize S.A. - API',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check
app.get('/api/v1/health', async (req, res) => {
  const squarenetHealth = await squarenetService.healthCheck();
  
  res.json({
    success: true,
    message: 'API en funcionamiento',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
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
    // Conectar a base de datos
    await connectDatabase();
    logger.info('✓ Base de datos conectada exitosamente');

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
║  🗄️  Base de datos: PostgreSQL               ║
║  🔗 Squarenet: ${squarenetStatus ? 'Conectado' : 'Desconectado'}             ║
╚══════════════════════════════════════════════╝
      `);
      logger.info('Servidor iniciado correctamente');
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
