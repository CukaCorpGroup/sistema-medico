import { Router } from 'express';
import * as medicalRecordController from '../controllers/medical-record.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', medicalRecordController.createMedicalRecord);
router.get('/', medicalRecordController.getMedicalRecords);
router.get('/export/excel', medicalRecordController.exportMedicalRecordsToExcel);
router.get('/:id', medicalRecordController.getMedicalRecordById);
router.put('/:id', medicalRecordController.updateMedicalRecord);
router.delete('/:id', medicalRecordController.deleteMedicalRecord);

export default router;






