import { Router } from 'express';
import * as cie10Controller from '../controllers/cie10.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/search', cie10Controller.searchCIE10);
router.get('/code/:code', cie10Controller.getCIE10ByCode);
router.get('/', cie10Controller.getAllCIE10);
router.post('/', roleMiddleware('admin'), cie10Controller.createCIE10);
router.post('/bulk', roleMiddleware('admin'), cie10Controller.bulkCreateCIE10);
router.put('/:id', roleMiddleware('admin'), cie10Controller.updateCIE10);

export default router;





