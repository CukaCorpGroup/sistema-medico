import { Router } from 'express';
import * as certificateController from '../controllers/certificate.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', certificateController.createCertificate);
router.get('/', certificateController.getCertificates);
router.get('/export/excel', certificateController.exportCertificatesToExcel);
router.get('/:id', certificateController.getCertificateById);
router.get('/:id/pdf', certificateController.generateCertificatePDF);
router.put('/:id', certificateController.updateCertificate);

export default router;



