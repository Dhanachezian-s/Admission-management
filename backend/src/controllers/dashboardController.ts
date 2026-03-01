import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export const DashboardController = {
    /**
     * GET /dashboard/summary/:programId
     * Returns detailed stats for a single program (intake, admitted, quota breakdown, filtered pending counts).
     */
    async summary(req: Request, res: Response) {
        try {
            const result = await DashboardService.getProgramSummary(Number(req.params.programId));
            return res.json(result);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * GET /dashboard/global
     * Returns system-wide statistics: total intake, total admitted, global quota usage, and per-program status breakdown.
     */
    async global(req: Request, res: Response) {
        try {
            const result = await DashboardService.getGlobalSummary();
            return res.json(result);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    }
};
