import { Request, Response } from 'express';
import { InstitutionService } from '../services/institutionService';

export const InstitutionController = {
  /**
   * POST /api/masters/institution
   * Body: { name: string, code: string }
   * Creates a new institution.
   */
  async create(req: Request, res: Response) {
    try {
      const { name, code } = req.body;
      const inst = await InstitutionService.create(name, code);
      return res.json(inst);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * GET /api/masters/institutions
   * Returns a list of all institutions.
   */
  async list(_req: Request, res: Response) {
    try {
      const list = await InstitutionService.list();
      return res.json(list);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * POST /api/masters/institution/cap
   * Body: { institutionId: number, categoryCode: string, capLimit: number }
   * Sets a seat cap for a specific student category within an institution.
   */
  async addCap(req: Request, res: Response) {
    try {
      const { institutionId, categoryCode, capLimit } = req.body;
      const cap = await InstitutionService.addCap(institutionId, categoryCode, capLimit);
      return res.json(cap);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },
};
