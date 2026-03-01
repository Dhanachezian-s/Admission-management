import { AppDataSource } from '../data-source';
import { Campus } from '../entities/Campus';
import { Institution } from '../entities/Institution';

export class CampusService {
    static async createCampus(institutionId: number, name: string): Promise<Campus> {
        const institution = await AppDataSource.getRepository(Institution).findOneByOrFail({ id: institutionId });
        const campus = AppDataSource.getRepository(Campus).create({ name, institution });
        await AppDataSource.getRepository(Campus).save(campus);
        return campus;
    }

    static async listCampuses(): Promise<Campus[]> {
        return AppDataSource.getRepository(Campus).find({ relations: { institution: true } });
    }
}
