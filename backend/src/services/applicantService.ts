import { AppDataSource } from '../data-source';
import { Applicant, DocumentStatus, FeeStatus } from '../entities/Applicant';
import { Admission } from '../entities/Admission';

export class ApplicantService {
    static async createApplicant(data: Partial<Applicant>): Promise<Applicant> {
        const repo = AppDataSource.getRepository(Applicant);
        const applicant = repo.create(data);
        await repo.save(applicant);
        return applicant;
    }

    static async listApplicants(): Promise<Applicant[]> {
        return AppDataSource.getRepository(Applicant).find({
            relations: { admissions: { program: true } },
        });
    }

    static async getApplicantDetails(id: number): Promise<any> {
        const applicant = await AppDataSource.getRepository(Applicant).findOneByOrFail({ id });
        const admissions = await AppDataSource.getRepository(Admission).find({
            where: { applicant: { id: applicant.id } },
            relations: { program: { academicYear: true, department: { campus: { institution: true } } } },
        });
        return { ...applicant, admissions };
    }

    static async updateDocumentStatus(id: number, documentStatus: DocumentStatus): Promise<Applicant> {
        const repo = AppDataSource.getRepository(Applicant);
        const applicant = await repo.findOneByOrFail({ id });
        applicant.documentStatus = documentStatus;
        await repo.save(applicant);
        return applicant;
    }

    static async updateFeeStatus(id: number, feeStatus: FeeStatus): Promise<Applicant> {
        const repo = AppDataSource.getRepository(Applicant);
        const applicant = await repo.findOneByOrFail({ id });
        applicant.feeStatus = feeStatus;
        await repo.save(applicant);
        return applicant;
    }
}
