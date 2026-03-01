import { Router } from 'express';
import { ApplicantController } from '../controllers/applicantController';

const router = Router();

router.post('/', ApplicantController.create);
router.get('/', ApplicantController.list);
router.get('/:id', ApplicantController.getDetails);
router.patch('/:id/document-status', ApplicantController.updateDocumentStatus);
router.patch('/:id/fee-status', ApplicantController.updateFeeStatus);

export default router;
