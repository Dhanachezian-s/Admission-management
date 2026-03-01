import { Request, Response } from 'express';
import { CampusService } from '../services/campusService';

export const CampusController = {
  /**
   * POST /api/masters/campus
   * Body: { institutionId: number, name: string }
   * Creates a new campus under an existing institution.
   */
  async create(req: Request, res: Response) {
    try {
      const { institutionId, name } = req.body;
      const campus = await CampusService.createCampus(Number(institutionId), name);
      return res.json(campus);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * GET /api/masters/campuses
   * Returns a list of all campuses with their parent institution.
   */
  async list(_req: Request, res: Response) {
    try {
      const list = await CampusService.listCampuses();
      return res.json(list);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },
};
