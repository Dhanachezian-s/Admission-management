import { AppDataSource } from '../data-source'
import { AcademicYear } from '../entities/AcademicYear'
import { Department } from '../entities/Department'
import { Program } from '../entities/Program'
import { ProgramQuota, QuotaType } from '../entities/ProgramQuota'
import { ProgramRepository } from '../repositories/programRepository'

export const ProgramService = {
  async createAcademicYear(year: number) {
    const repo = AppDataSource.getRepository(AcademicYear)
    const existing = await repo.findOneBy({ year })
    if (existing) return existing
    const ay = repo.create({ year })
    return repo.save(ay)
  },
  listAcademicYears() {
    return AppDataSource.getRepository(AcademicYear).find()
  },
  async createProgram(params: {
    departmentId: string
    academicYearId: string
    name: string
    code: string
    courseType: 'UG' | 'PG'
    entryType: 'Regular' | 'Lateral'
    admissionMode: 'Government' | 'Management'
    intake: number
    supernumerarySeats?: number
  }) {
    const department = await AppDataSource.getRepository(Department).findOneByOrFail({ id: Number(params.departmentId) })
    const academicYear = await AppDataSource.getRepository(AcademicYear).findOneByOrFail({ id: Number(params.academicYearId) })
    const repo = AppDataSource.getRepository(Program)
    const program = repo.create({
      department,
      academicYear,
      name: params.name,
      code: params.code,
      courseType: params.courseType,
      entryType: params.entryType,
      admissionMode: params.admissionMode,
      intake: params.intake,
      supernumerarySeats: params.supernumerarySeats || 0,
    })
    return repo.save(program)
  },
  listPrograms() {
    return ProgramRepository.listWithRelations()
  },
  async setQuotas(programId: string, quotas: Array<{ quotaType: QuotaType; seats: number }>) {
    const program = await AppDataSource.getRepository(Program).findOneByOrFail({ id: Number(programId) })
    const total = quotas.reduce((acc, q) => acc + (q.seats || 0), 0)
    if (total !== program.intake) {
      throw new Error('Total base quota must equal intake')
    }
    const repo = AppDataSource.getRepository(ProgramQuota)
    for (const q of quotas) {
      const pq = repo.create({ program, quotaType: q.quotaType, seats: q.seats })
      await repo.save(pq)
    }
    return repo.find({ where: { program: { id: program.id } } })
  },
  listQuotas(programId: number) {
    return AppDataSource.getRepository(ProgramQuota).find({ where: { program: { id: programId } } })
  },
}
