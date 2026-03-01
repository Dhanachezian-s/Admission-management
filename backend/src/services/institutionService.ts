import { AppDataSource } from '../data-source'
import { Institution } from '../entities/Institution'
import { InstitutionCap } from '../entities/InstitutionCap'

export const InstitutionService = {
  async create(name: string, code: string) {
    const repo = AppDataSource.getRepository(Institution)
    const inst = repo.create({ name, code })
    return repo.save(inst)
  },
  list() {
    return AppDataSource.getRepository(Institution).find()
  },
  async addCap(institutionId: string, categoryCode: string, capLimit: number) {
    const inst = await AppDataSource.getRepository(Institution).findOneByOrFail({ id: Number(institutionId) })
    const capRepo = AppDataSource.getRepository(InstitutionCap)
    const cap = capRepo.create({ institution: inst, categoryCode, capLimit })
    return capRepo.save(cap)
  },
}
