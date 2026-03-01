import { Router } from 'express'
import { InstitutionController } from './controllers/institutionController'
import { CampusController } from './controllers/campusController'
import { DepartmentController } from './controllers/departmentController'
import { ProgramController } from './controllers/programController'
import { requireRole } from './middlewares/authMiddleware'

const router = Router()

// All roles can read master data
const readRoles = requireRole('ADMIN', 'OFFICER', 'MANAGEMENT')
// Only admins can write master data
const writeRoles = requireRole('ADMIN')

router.post('/masters/institution', writeRoles, InstitutionController.create)
router.get('/masters/institutions', readRoles, InstitutionController.list)
router.post('/masters/institution/cap', writeRoles, InstitutionController.addCap)

router.post('/masters/campus', writeRoles, CampusController.create)
router.get('/masters/campuses', readRoles, CampusController.list)

router.post('/masters/department', writeRoles, DepartmentController.create)
router.get('/masters/departments', readRoles, DepartmentController.list)

router.post('/masters/academic-year', writeRoles, ProgramController.createAcademicYear)
router.get('/masters/academic-years', readRoles, ProgramController.listAcademicYears)

router.post('/masters/program', writeRoles, ProgramController.createProgram)
router.get('/masters/programs', readRoles, ProgramController.listPrograms)
router.post('/masters/program/quotas', writeRoles, ProgramController.setQuotas)
router.get('/masters/program/:id/quotas', readRoles, ProgramController.listQuotas)

export default router
