import { Request, Response } from 'express';
import { AllocationService } from '../services/allocationService';

export const AllocationController = {
    /**
     * POST /allocation/allocate
     * Body: { applicantId, programId, quotaType, allotmentNumber? }
     * Temporarily allocates a seat to an applicant. Status becomes 'Allocated'.
     */
    async allocate(req: Request, res: Response) {
        try {
            const { applicantId, programId, quotaType, allotmentNumber } = req.body;
            const admission = await AllocationService.allocate(applicantId, programId, quotaType, allotmentNumber);
            return res.json(admission);
        } catch (e: any) {
            console.error(e);
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * POST /allocation/confirm
     * Body: { applicantId, programId }
     * Finalizes the admission once documents are verified and fees paid. Generates a unique admission number.
     */
    async confirm(req: Request, res: Response) {
        try {
            const { applicantId, programId } = req.body;
            const admission = await AllocationService.confirm(applicantId, programId);
            return res.json(admission);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * GET /allocation/remaining/:programId
     * Returns live seat availability matrix (total, filled, remaining) per quota for a program.
     */
    async remaining(req: Request, res: Response) {
        try {
            const result = await AllocationService.getRemainingSeats(Number(req.params.programId));
            return res.json(result);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    }
};
