import { Router } from 'express';
import { InstitutionController } from '../controllers/institutionController';
import { CampusController } from '../controllers/campusController';
import { DepartmentController } from '../controllers/departmentController';
import { ProgramController } from '../controllers/programController';
import { requireRole } from '../middlewares/authMiddleware';

const router = Router();

// All roles can read master data
const readRoles = requireRole('ADMIN', 'OFFICER', 'MANAGEMENT');
// Only admins can write master data
const writeRoles = requireRole('ADMIN');

router.post('/institution', writeRoles, InstitutionController.create);
router.get('/institutions', readRoles, InstitutionController.list);
router.post('/institution/cap', writeRoles, InstitutionController.addCap);

router.post('/campus', writeRoles, CampusController.create);
router.get('/campuses', readRoles, CampusController.list);

router.post('/department', writeRoles, DepartmentController.create);
router.get('/departments', readRoles, DepartmentController.list);

router.post('/academic-year', writeRoles, ProgramController.createAcademicYear);
router.get('/academic-years', readRoles, ProgramController.listAcademicYears);

router.post('/program', writeRoles, ProgramController.createProgram);
router.get('/programs', readRoles, ProgramController.listPrograms);
router.post('/program/quotas', writeRoles, ProgramController.setQuotas);
router.get('/program/:id/quotas', readRoles, ProgramController.listQuotas);

export default router;
