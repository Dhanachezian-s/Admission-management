import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';

const router = Router();

router.get('/summary/:programId', DashboardController.summary);
router.get('/global', DashboardController.global);

export default router;
