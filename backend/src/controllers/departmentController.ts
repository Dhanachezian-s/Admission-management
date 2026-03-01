import { Request, Response } from 'express';
import { DepartmentService } from '../services/departmentService';

export const DepartmentController = {
  /**
   * POST /api/masters/department
   * Body: { campusId: number, name: string }
   * Creates a new department under an existing campus.
   */
  async create(req: Request, res: Response) {
    try {
      const { campusId, name } = req.body;
      const department = await DepartmentService.createDepartment(Number(campusId), name);
      return res.json(department);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * GET /api/masters/departments
   * Returns all departments with their parent campus and institution.
   */
  async list(_req: Request, res: Response) {
    try {
      const list = await DepartmentService.listDepartments();
      return res.json(list);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },
};
