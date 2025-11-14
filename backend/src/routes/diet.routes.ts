import { Router } from 'express';
import * as dietController from '../controllers/diet.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', dietController.createDietRecord);
router.get('/', dietController.getDietRecords);
router.get('/export/excel', dietController.exportDietToExcel);
router.get('/:id', dietController.getDietRecordById);
router.put('/:id', dietController.updateDietRecord);

export default router;

