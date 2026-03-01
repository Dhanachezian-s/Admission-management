import { AppDataSource } from '../data-source'
import { Program } from '../entities/Program'

export const ProgramRepository = {
  repo() {
    return AppDataSource.getRepository(Program)
  },
  listWithRelations() {
    return this.repo().find({
      relations: { department: { campus: { institution: true } }, academicYear: true },
    })
  },
}

