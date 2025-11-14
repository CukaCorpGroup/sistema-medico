import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import cie10Routes from './cie10.routes';
import medicalRecordRoutes from './medical-record.routes';
import incidentRoutes from './incident.routes';
import antidopingRoutes from './antidoping.routes';
import glovesRoutes from './gloves.routes';
import dietRoutes from './diet.routes';
import certificateRoutes from './certificate.routes';

const router = Router();

// Montar todas las rutas
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/cie10', cie10Routes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/incidents', incidentRoutes);
router.use('/antidoping', antidopingRoutes);
router.use('/gloves', glovesRoutes);
router.use('/diets', dietRoutes);
router.use('/certificates', certificateRoutes);

export default router;



