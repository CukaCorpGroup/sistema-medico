import axios, { AxiosInstance } from 'axios';
import logger from './logger';

interface SquarenetEmployee {
  identification: string;
  firstName: string;
  lastName: string;
  position: string;
  workArea: string;
  gender: string;
  phone?: string;
  email?: string;
  company: string;
  address?: string;
  disability?: string;
  disabilityDescription?: string;
  vulnerable?: string;
  vulnerableDescription?: string;
}

class SquarenetService {
  private client: AxiosInstance;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.SQUARENET_ENABLED === 'true';
    
    this.client = axios.create({
      baseURL: process.env.SQUARENET_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Agregar interceptor para token de autenticación si es necesario
    if (process.env.SQUARENET_API_KEY) {
      this.client.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${process.env.SQUARENET_API_KEY}`;
        return config;
      });
    }

    logger.info(`Squarenet Service initialized - Enabled: ${this.enabled}`);
  }

  /**
   * Busca un empleado por su número de identificación en Squarenet
   * @param identification - Cédula del empleado
   * @returns Datos del empleado desde Squarenet o null si no se encuentra
   */
  async searchEmployeeByIdentification(identification: string): Promise<SquarenetEmployee | null> {
    if (!this.enabled) {
      logger.warn('Squarenet service is disabled, returning mock data');
      return this.getMockEmployee(identification);
    }

    try {
      logger.info(`Buscando empleado en Squarenet: ${identification}`);
      
      const response = await this.client.get(`/employees/search`, {
        params: { identification },
      });

      if (response.data && response.data.success) {
        logger.info(`Empleado encontrado en Squarenet: ${identification}`);
        return this.mapSquarenetEmployee(response.data.data);
      }

      logger.warn(`Empleado no encontrado en Squarenet: ${identification}`);
      return null;
    } catch (error: any) {
      logger.error('Error al buscar empleado en Squarenet:', {
        identification,
        error: error.message,
        status: error.response?.status,
      });
      
      // En caso de error, retornar datos mock en desarrollo
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Retornando datos mock por error en Squarenet');
        return this.getMockEmployee(identification);
      }
      
      throw new Error('Error al conectar con sistema de nómina Squarenet');
    }
  }

  /**
   * Obtiene la lista de empleados activos de la nómina
   * @returns Lista de empleados activos
   */
  async getActiveEmployees(): Promise<SquarenetEmployee[]> {
    if (!this.enabled) {
      logger.warn('Squarenet service is disabled, returning mock data');
      return [this.getMockEmployee('1234567890')];
    }

    try {
      logger.info('Obteniendo empleados activos desde Squarenet');
      
      const response = await this.client.get('/employees/active');

      if (response.data && response.data.success) {
        logger.info(`Empleados activos obtenidos: ${response.data.data.length}`);
        return response.data.data.map((emp: any) => this.mapSquarenetEmployee(emp));
      }

      return [];
    } catch (error: any) {
      logger.error('Error al obtener empleados activos de Squarenet:', {
        error: error.message,
        status: error.response?.status,
      });
      
      if (process.env.NODE_ENV === 'development') {
        return [this.getMockEmployee('1234567890')];
      }
      
      throw new Error('Error al conectar con sistema de nómina Squarenet');
    }
  }

  /**
   * Mapea los datos de Squarenet al formato interno
   */
  private mapSquarenetEmployee(data: any): SquarenetEmployee {
    return {
      identification: data.cedula || data.identification || data.id,
      firstName: data.nombres || data.firstName || data.name,
      lastName: data.apellidos || data.lastName || data.surname,
      position: data.puesto || data.position || data.cargo,
      workArea: data.area || data.workArea || data.departamento,
      gender: data.genero || data.gender || data.sexo,
      phone: data.telefono || data.phone || data.celular,
      email: data.email || data.correo,
      company: data.empresa || data.company || 'Marbelize S.A.',
      address: data.direccion || data.address,
      disability: data.discapacidad || data.disability || data.discapacitado,
      disabilityDescription: data.descripcionDiscapacidad || data.disabilityDescription || data.descripcion_discapacidad || '',
      vulnerable: data.vulnerable || data.vulnerabilidad,
      vulnerableDescription: data.descripcionVulnerabilidad || data.vulnerableDescription || data.descripcion_vulnerabilidad || '',
    };
  }

  /**
   * Retorna datos mock para desarrollo/testing
   */
  private getMockEmployee(identification: string): SquarenetEmployee {
    // Datos de prueba: si la identificación es diferente a la predeterminada, retornar otro paciente con discapacidad
    if (identification !== '0803232321' && identification !== '1234567890') {
      return {
        identification,
        firstName: 'María Elena',
        lastName: 'Rodríguez López',
        position: 'Supervisora de Calidad',
        workArea: 'Control de Calidad',
        gender: 'Femenino',
        phone: '0987654321',
        email: 'maria.rodriguez@marbelize.com',
        company: 'Marbelize S.A.',
        address: 'Guayaquil, Ecuador',
        disability: 'SI',
        disabilityDescription: 'Discapacidad física parcial en miembro superior derecho', // Descripción de discapacidad
        vulnerable: 'SI',
        vulnerableDescription: 'DIABETES', // Descripción de vulnerabilidad desde lista maestra
      };
    }
    
    // Paciente predeterminado sin discapacidad
    return {
      identification,
      firstName: 'Juan Carlos',
      lastName: 'Pérez García',
      position: 'Operador de Producción',
      workArea: 'Producción',
      gender: 'Masculino',
      phone: '0999123456',
      email: 'juan.perez@marbelize.com',
      company: 'Marbelize S.A.',
      address: 'Quito, Ecuador',
      disability: 'NO',
      disabilityDescription: '', // Sin discapacidad
      vulnerable: 'NO',
    };
  }

  /**
   * Verifica la conexión con Squarenet
   */
  async healthCheck(): Promise<boolean> {
    if (!this.enabled) {
      return true; // En modo deshabilitado, siempre retorna true
    }

    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error('Squarenet health check failed:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export default new SquarenetService();



