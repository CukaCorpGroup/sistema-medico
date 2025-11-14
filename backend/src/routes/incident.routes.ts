import { Router } from 'express';
import * as incidentController from '../controllers/incident.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', incidentController.createIncident);
router.get('/', incidentController.getIncidents);
router.get('/export/excel', incidentController.exportIncidentsToExcel);
router.get('/:id', incidentController.getIncidentById);
router.get('/:id/pdf', incidentController.generateIncidentPDF);
router.put('/:id', incidentController.updateIncident);

export default router;





