import { Request, Response } from 'express';
import { ApplicantService } from '../services/applicantService';

export const ApplicantController = {
    /**
     * POST /applicants
     * Registers a new applicant with personal, academic, and quota details.
     */
    async create(req: Request, res: Response) {
        try {
            const applicant = await ApplicantService.createApplicant(req.body);
            return res.json(applicant);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * GET /applicants
     * Returns a list of all registered applicants.
     */
    async list(req: Request, res: Response) {
        try {
            const list = await ApplicantService.listApplicants();
            return res.json(list);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * GET /applicants/:id
     * Returns the full profile and current admission status of a specific applicant.
     */
    async getDetails(req: Request, res: Response) {
        try {
            const details = await ApplicantService.getApplicantDetails(Number(req.params.id));
            return res.json(details);
        } catch (e: any) {
            return res.status(404).json({ error: e.message });
        }
    },

    /**
     * PATCH /applicants/:id/document-status
     * Body: { documentStatus: 'Pending' | 'Submitted' | 'Verified' }
     * Updates the status of applicant's documentation.
     */
    async updateDocumentStatus(req: Request, res: Response) {
        try {
            const applicant = await ApplicantService.updateDocumentStatus(Number(req.params.id), req.body.documentStatus);
            return res.json(applicant);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * PATCH /applicants/:id/fee-status
     * Body: { feeStatus: 'Pending' | 'Paid' }
     * Updates the payment status for an applicant.
     */
    async updateFeeStatus(req: Request, res: Response) {
        try {
            const applicant = await ApplicantService.updateFeeStatus(Number(req.params.id), req.body.feeStatus);
            return res.json(applicant);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    }
};
