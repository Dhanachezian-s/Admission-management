import { Request, Response } from 'express';
import { ProgramService } from '../services/programService';

export const ProgramController = {
  /**
   * POST /api/masters/academic-year
   * Body: { year: number }
   * Creates a new academic year (idempotent – returns existing if already present).
   */
  async createAcademicYear(req: Request, res: Response) {
    try {
      const { year } = req.body;
      const ay = await ProgramService.createAcademicYear(Number(year));
      return res.json(ay);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * GET /api/masters/academic-years
   * Returns all academic years.
   */
  async listAcademicYears(_req: Request, res: Response) {
    try {
      const list = await ProgramService.listAcademicYears();
      return res.json(list);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * POST /api/masters/program
   * Body: { departmentId, academicYearId, name, code, courseType, entryType, admissionMode, intake, supernumerarySeats? }
   * Creates a new program under a department for an academic year.
   */
  async createProgram(req: Request, res: Response) {
    try {
      const prog = await ProgramService.createProgram(req.body);
      return res.json(prog);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * GET /api/masters/programs
   * Returns all programs with department, campus, institution, academic year, and quota relations.
   */
  async listPrograms(_req: Request, res: Response) {
    try {
      const list = await ProgramService.listPrograms();
      return res.json(list);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * POST /api/masters/program/quotas
   * Body: { programId: number, quotas: Array<{ quotaType: 'KCET' | 'COMEDK' | 'Management', seats: number }> }
   * Sets or replaces quota seat distribution for a program. Total must equal program intake.
   */
  async setQuotas(req: Request, res: Response) {
    try {
      const { programId, quotas } = req.body;
      const saved = await ProgramService.setQuotas(programId, quotas);
      return res.json(saved);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },

  /**
   * GET /api/masters/program/:id/quotas
   * Returns quota seat allocation for a specific program.
   */
  async listQuotas(req: Request, res: Response) {
    try {
      const list = await ProgramService.listQuotas(Number(req.params.id));
      return res.json(list);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  },
};
