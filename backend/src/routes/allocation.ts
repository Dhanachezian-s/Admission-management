import { Router } from 'express';
import { AllocationController } from '../controllers/allocationController';

const router = Router();

router.post('/allocate', AllocationController.allocate);
router.post('/confirm', AllocationController.confirm);
router.get('/remaining/:programId', AllocationController.remaining);

export default router;
