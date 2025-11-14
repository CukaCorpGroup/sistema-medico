import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/search', patientController.searchPatient);
router.get('/', patientController.getAllPatients);
router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient);

export default router;





