import { AppDataSource } from '../data-source';
import { Department } from '../entities/Department';
import { Campus } from '../entities/Campus';

export class DepartmentService {
    static async createDepartment(campusId: number, name: string): Promise<Department> {
        const campus = await AppDataSource.getRepository(Campus).findOneByOrFail({ id: campusId });
        const department = AppDataSource.getRepository(Department).create({ name, campus });
        await AppDataSource.getRepository(Department).save(department);
        return department;
    }

    static async listDepartments(): Promise<Department[]> {
        return AppDataSource.getRepository(Department).find({ relations: { campus: { institution: true } } });
    }
}
