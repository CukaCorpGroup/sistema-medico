import { Router } from 'express';
import * as glovesController from '../controllers/gloves.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', glovesController.createGlovesRecord);
router.get('/', glovesController.getGlovesRecords);
router.get('/export/excel', glovesController.exportGlovesToExcel);
router.get('/:id', glovesController.getGlovesRecordById);
router.put('/:id', glovesController.updateGlovesRecord);

export default router;






