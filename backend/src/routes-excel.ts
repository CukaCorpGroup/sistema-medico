import { Router } from 'express';
import * as authController from './controllers/auth-excel.controller';
import * as patientController from './controllers/patient-excel.controller';
import * as cie10Controller from './controllers/cie10-excel.controller';
import * as medicalRecordController from './controllers/medical-record-excel.controller';
import * as incidentController from './controllers/incident-excel.controller';
import * as antidopingController from './controllers/antidoping-excel.controller';
import * as certificateController from './controllers/certificate-excel.controller';
import * as glovesController from './controllers/gloves-excel.controller';
import * as dietController from './controllers/diet-excel.controller';
import * as vulnerabilityController from './controllers/vulnerability-excel.controller';
import { authMiddleware } from './middleware/auth.middleware';
import { upload } from './controllers/medical-record-excel.controller';

const router = Router();

// Rutas de autenticación
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

// Rutas de pacientes
router.get('/patients/search', authMiddleware, patientController.searchPatient);
router.get('/patients', authMiddleware, patientController.getAllPatients);

// Rutas de CIE-10
router.get('/cie10/search', authMiddleware, cie10Controller.searchCIE10);
router.get('/cie10', authMiddleware, cie10Controller.getAllCIE10);

// Rutas de vulnerabilidades
router.get('/vulnerabilities/search', authMiddleware, vulnerabilityController.searchVulnerabilities);
router.get('/vulnerabilities', authMiddleware, vulnerabilityController.getAllVulnerabilities);
router.post('/vulnerabilities', authMiddleware, vulnerabilityController.createVulnerability);

// Rutas de registros médicos
router.post('/medical-records', authMiddleware, medicalRecordController.createMedicalRecord);
router.get('/medical-records', authMiddleware, medicalRecordController.getMedicalRecords);
router.get('/medical-records/secondary-code', authMiddleware, medicalRecordController.getSecondaryCodeByCIE10);
router.get('/medical-records/export/excel', authMiddleware, medicalRecordController.exportMedicalRecordsToExcel);
router.post('/medical-records/send-prescription-email', authMiddleware, upload.single('pdf'), medicalRecordController.sendPrescriptionEmail);

// Rutas de incidentes
router.post('/incidents', authMiddleware, incidentController.createIncident);
router.get('/incidents', authMiddleware, incidentController.getIncidents);
router.get('/incidents/export/excel', authMiddleware, incidentController.exportIncidentsToExcel);

// Rutas de antidoping
router.post('/antidoping', authMiddleware, antidopingController.createAntidoping);
router.get('/antidoping', authMiddleware, antidopingController.getAntidopingRecords);
router.get('/antidoping/export/excel', authMiddleware, antidopingController.exportAntidopingToExcel);

// Rutas de certificados
router.post('/certificates', authMiddleware, certificateController.createCertificate);
router.get('/certificates', authMiddleware, certificateController.getCertificates);
router.get('/certificates/export/excel', authMiddleware, certificateController.exportCertificatesToExcel);

// Rutas de guantes
router.post('/gloves', authMiddleware, glovesController.createGlovesRecord);
router.get('/gloves', authMiddleware, glovesController.getGlovesRecords);
router.get('/gloves/export/excel', authMiddleware, glovesController.exportGlovesToExcel);

// Rutas de dieta
router.post('/diets', authMiddleware, dietController.createDietRecord);
router.get('/diets', authMiddleware, dietController.getDietRecords);
router.get('/diets/export/excel', authMiddleware, dietController.exportDietToExcel);

export default router;


