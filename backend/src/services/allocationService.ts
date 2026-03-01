import { AppDataSource } from '../data-source';
import { Applicant } from '../entities/Applicant';
import { Program } from '../entities/Program';
import { ProgramQuota } from '../entities/ProgramQuota';
import { Admission } from '../entities/Admission';
import { Institution } from '../entities/Institution';

export class AllocationService {
    static async isInstitutionCapAvailable(applicant: Applicant, program: Program): Promise<boolean> {
        if (applicant.category !== 'JK') return true;
        const institution = await AppDataSource.getRepository(Institution).findOne({
            where: { campuses: { departments: { programs: { id: program.id } } } },
            relations: { campuses: { departments: { programs: true } }, caps: true },
        });
        if (!institution) return true;
        const cap = institution.caps.find((c) => c.categoryCode === 'JK');
        if (!cap) return true;
        const count = await AppDataSource.getRepository(Admission)
            .createQueryBuilder('ad')
            .leftJoin('ad.applicant', 'app')
            .leftJoin('ad.program', 'prog')
            .leftJoin('prog.department', 'dept')
            .leftJoin('dept.campus', 'campus')
            .leftJoin('campus.institution', 'inst')
            .where('inst.id = :instId', { instId: institution.id })
            .andWhere('app.category = :cat', { cat: 'JK' })
            .getCount();
        return count < cap.capLimit;
    }

    static async isQuotaAvailable(programId: number, quotaType: 'KCET' | 'COMEDK' | 'Management'): Promise<boolean> {
        const quota = await AppDataSource.getRepository(ProgramQuota).findOne({
            where: { program: { id: programId }, quotaType },
            relations: { program: true },
        });
        if (!quota) return false;
        const used = await AppDataSource.getRepository(Admission)
            .createQueryBuilder('ad')
            .leftJoin('ad.program', 'prog')
            .where('prog.id = :pid', { pid: programId })
            .andWhere('ad.quotaType = :qt', { qt: quotaType })
            .getCount();
        return used < quota.seats;
    }

    static async allocate(applicantId: string, programId: string, quotaType: 'KCET' | 'COMEDK' | 'Management', allotmentNumber?: string): Promise<Admission> {
        const applicantRepo = AppDataSource.getRepository(Applicant);
        const programRepo = AppDataSource.getRepository(Program);
        const admissionRepo = AppDataSource.getRepository(Admission);

        const applicant = await applicantRepo.findOneByOrFail({ id: Number(applicantId) });
        const program = await programRepo.findOne({
            where: { id: Number(programId) },
            relations: { academicYear: true, department: { campus: { institution: true } } },
        });
        if (!program) throw new Error('Program not found');

        if ((quotaType === 'KCET' || quotaType === 'COMEDK') && allotmentNumber) {
            applicant.allotmentNumber = allotmentNumber;
            await applicantRepo.save(applicant);
        }

        const quotaOk = await AllocationService.isQuotaAvailable(Number(programId), quotaType);
        if (!quotaOk) {
            throw new Error('Quota full. Allocation blocked.');
        }

        const capOk = await AllocationService.isInstitutionCapAvailable(applicant, program);
        if (!capOk) {
            throw new Error('Institution-level cap exceeded.');
        }

        const existing = await admissionRepo.findOne({ where: { applicant: { id: Number(applicantId) }, program: { id: Number(programId) } } });
        if (existing) {
            throw new Error('Applicant already allocated for this program.');
        }

        const admission = admissionRepo.create({ applicant, program, quotaType, status: 'Allocated' });
        await admissionRepo.save(admission);
        return admission;
    }

    static quotaCode(q: 'KCET' | 'COMEDK' | 'Management'): string {
        if (q === 'KCET') return 'KCET';
        if (q === 'COMEDK') return 'COMEDK';
        return 'MGMT';
    }

    static async confirm(applicantId: string, programId: string): Promise<Admission> {
        const applicantRepo = AppDataSource.getRepository(Applicant);
        const admissionRepo = AppDataSource.getRepository(Admission);
        const programRepo = AppDataSource.getRepository(Program);

        const applicant = await applicantRepo.findOneByOrFail({ id: Number(applicantId) });
        const program = await programRepo.findOne({
            where: { id: Number(programId) },
            relations: { academicYear: true, department: { campus: { institution: true } } },
        });
        if (!program) throw new Error('Program not found');

        const admission = await admissionRepo.findOne({
            where: { applicant: { id: Number(applicantId) }, program: { id: Number(programId) } },
            relations: { program: { academicYear: true, department: { campus: { institution: true } } }, applicant: true },
        });
        if (!admission) throw new Error('Seat not allocated yet');
        if (admission.status === 'Confirmed') return admission;

        if (applicant.documentStatus !== 'Verified') {
            throw new Error('Seat confirmation requires documents = Verified');
        }

        if (applicant.feeStatus !== 'Paid') {
            throw new Error('Seat confirmation requires fee = Paid');
        }

        const instCode = (admission.program.department.campus as any).institution.code;
        const year = admission.program.academicYear.year;
        const course = admission.program.courseType;
        const progCode = admission.program.code;
        const qcode = AllocationService.quotaCode(admission.quotaType as any);
        const basePrefix = `${instCode}/${year}/${course}/${progCode}/${qcode}`;

        const existingCount = await admissionRepo
            .createQueryBuilder('ad')
            .leftJoin('ad.program', 'prog')
            .leftJoin('prog.department', 'dept')
            .leftJoin('dept.campus', 'campus')
            .leftJoin('campus.institution', 'inst')
            .where('inst.code = :ic', { ic: instCode })
            .andWhere('prog.code = :pc', { pc: progCode })
            .andWhere('prog.courseType = :ct', { ct: course })
            .andWhere('prog.academicYearId = :ay', { ay: admission.program.academicYear.id })
            .andWhere('ad.quotaType = :qt', { qt: admission.quotaType })
            .andWhere('ad.status = :st', { st: 'Confirmed' })
            .getCount();

        const serial = String(existingCount + 1).padStart(4, '0');
        admission.admissionNumber = `${basePrefix}/${serial}`;
        admission.status = 'Confirmed';
        await admissionRepo.save(admission);
        return admission;
    }

    static async getRemainingSeats(programId: number): Promise<any[]> {
        const quotas = await AppDataSource.getRepository(ProgramQuota).find({ where: { program: { id: programId } } });
        const result = [];
        for (const q of quotas) {
            const used = await AppDataSource.getRepository(Admission)
                .createQueryBuilder('ad')
                .leftJoin('ad.program', 'prog')
                .where('prog.id = :pid', { pid: programId })
                .andWhere('ad.quotaType = :qt', { qt: q.quotaType })
                .getCount();
            result.push({ quotaType: q.quotaType, total: q.seats, used, remaining: Math.max(q.seats - used, 0) });
        }
        return result;
    }
}
