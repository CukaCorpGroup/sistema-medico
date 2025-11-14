import { Router } from 'express';
import * as antidopingController from '../controllers/antidoping.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', antidopingController.createAntidoping);
router.get('/', antidopingController.getAntidopingRecords);
router.get('/export/excel', antidopingController.exportAntidopingToExcel);
router.get('/:id', antidopingController.getAntidopingById);
router.put('/:id', antidopingController.updateAntidoping);

export default router;





