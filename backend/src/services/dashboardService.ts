import { AppDataSource } from '../data-source';
import { Program } from '../entities/Program';
import { ProgramQuota } from '../entities/ProgramQuota';
import { Admission } from '../entities/Admission';
import { Applicant } from '../entities/Applicant';

export class DashboardService {
    static async getProgramSummary(programId: number) {
        const program = await AppDataSource.getRepository(Program).findOneByOrFail({ id: programId });
        const quotas = await AppDataSource.getRepository(ProgramQuota).find({ where: { program: { id: programId } } });

        let admitted = 0;
        const quotaSummary: Array<{ quotaType: string; total: number; filled: number; remaining: number }> = [];

        for (const q of quotas) {
            const filled = await AppDataSource.getRepository(Admission)
                .createQueryBuilder('ad')
                .leftJoin('ad.program', 'prog')
                .where('prog.id = :pid', { pid: programId })
                .andWhere('ad.quotaType = :qt', { qt: q.quotaType })
                .getCount();
            admitted += filled;
            quotaSummary.push({ quotaType: q.quotaType, total: q.seats, filled, remaining: Math.max(q.seats - filled, 0) });
        }

        const remainingSeats = Math.max(program.intake - admitted, 0);

        const pendingDocs = await AppDataSource.getRepository(Applicant)
            .createQueryBuilder('a')
            .innerJoin('a.admissions', 'ad')
            .where('ad.programId = :pid', { pid: programId })
            .andWhere('a.documentStatus = :ds', { ds: 'Pending' })
            .getCount();

        const feePending = await AppDataSource.getRepository(Applicant)
            .createQueryBuilder('a')
            .innerJoin('a.admissions', 'ad')
            .where('ad.programId = :pid', { pid: programId })
            .andWhere('a.feeStatus = :fs', { fs: 'Pending' })
            .getCount();

        return {
            programName: program.name,
            totalIntake: program.intake,
            admitted,
            remainingSeats,
            quotaSummary,
            pendingDocumentsApplicants: pendingDocs,
            feePendingApplicants: feePending,
        };
    }

    static async getGlobalSummary() {
        const programs = await AppDataSource.getRepository(Program).find({
            relations: { quotas: true, department: { campus: { institution: true } } }
        });
        const totalIntake = programs.reduce((s, p) => s + p.intake, 0);
        const totalAdmitted = await AppDataSource.getRepository(Admission).count();
        const confirmed = await AppDataSource.getRepository(Admission).count({ where: { status: 'Confirmed' } });
        const allocated = await AppDataSource.getRepository(Admission).count({ where: { status: 'Allocated' } });

        // Only count applicants who have at least one admission (allocated/confirmed)
        const applicantsPendingDocs = await AppDataSource.getRepository(Applicant)
            .createQueryBuilder('a')
            .innerJoin('a.admissions', 'ad')
            .where('a.documentStatus = :ds', { ds: 'Pending' })
            .select(['a.id', 'a.firstName', 'a.lastName', 'a.phone', 'a.email'])
            .take(10)
            .getMany();
        const pendingDocs = await AppDataSource.getRepository(Applicant)
            .createQueryBuilder('a')
            .innerJoin('a.admissions', 'ad')
            .where('a.documentStatus = :ds', { ds: 'Pending' })
            .getCount();

        const applicantsPendingFee = await AppDataSource.getRepository(Applicant)
            .createQueryBuilder('a')
            .innerJoin('a.admissions', 'ad')
            .where('a.feeStatus = :fs', { fs: 'Pending' })
            .select(['a.id', 'a.firstName', 'a.lastName', 'a.phone', 'a.email'])
            .take(10)
            .getMany();
        const feePending = await AppDataSource.getRepository(Applicant)
            .createQueryBuilder('a')
            .innerJoin('a.admissions', 'ad')
            .where('a.feeStatus = :fs', { fs: 'Pending' })
            .getCount();

        const totalApplicants = await AppDataSource.getRepository(Applicant).count();

        // Calculate Global Quota Summary
        const globalQuotaSummaryMap: Record<string, { total: number; filled: number }> = {};
        for (const prog of programs) {
            for (const q of prog.quotas) {
                if (!globalQuotaSummaryMap[q.quotaType]) {
                    globalQuotaSummaryMap[q.quotaType] = { total: 0, filled: 0 };
                }
                globalQuotaSummaryMap[q.quotaType].total += q.seats;
            }
        }

        const allAdmissions = await AppDataSource.getRepository(Admission).find();
        for (const ad of allAdmissions) {
            if (globalQuotaSummaryMap[ad.quotaType]) {
                globalQuotaSummaryMap[ad.quotaType].filled += 1;
            }
        }

        const globalQuotaSummary = Object.keys(globalQuotaSummaryMap).map(type => ({
            quotaType: type,
            total: globalQuotaSummaryMap[type].total,
            filled: globalQuotaSummaryMap[type].filled,
            remaining: Math.max(globalQuotaSummaryMap[type].total - globalQuotaSummaryMap[type].filled, 0)
        }));

        const progStatsRaw = await AppDataSource.getRepository(Admission)
            .createQueryBuilder('ad')
            .innerJoin('ad.applicant', 'app')
            .select('ad.programId', 'programId')
            .addSelect('COUNT(ad.id)', 'admitted')
            .addSelect("SUM(CASE WHEN ad.status = 'Confirmed' THEN 1 ELSE 0 END)", 'confirmed')
            .addSelect("SUM(CASE WHEN ad.status = 'Allocated' THEN 1 ELSE 0 END)", 'allocated')
            .addSelect("SUM(CASE WHEN app.documentStatus = 'Pending' THEN 1 ELSE 0 END)", 'pendingDocs')
            .addSelect("SUM(CASE WHEN app.feeStatus = 'Pending' THEN 1 ELSE 0 END)", 'feePending')
            .groupBy('ad.programId')
            .getRawMany();

        const progStatsMap: Record<number, any> = {};
        progStatsRaw.forEach(s => {
            progStatsMap[Number(s.programId)] = {
                admitted: Number(s.admitted),
                confirmed: Number(s.confirmed),
                allocated: Number(s.allocated),
                pendingDocs: Number(s.pendingDocs),
                feePending: Number(s.feePending)
            };
        });

        const programSummaries = programs.map(prog => {
            const stats = progStatsMap[prog.id] || { admitted: 0, confirmed: 0, allocated: 0, pendingDocs: 0, feePending: 0 };
            return {
                id: prog.id,
                name: prog.name,
                code: prog.code,
                intake: prog.intake,
                admitted: stats.admitted,
                confirmed: stats.confirmed,
                allocated: stats.allocated,
                pendingDocs: stats.pendingDocs,
                feePending: stats.feePending,
                remaining: Math.max(prog.intake - stats.admitted, 0),
                department: prog.department,
            };
        });

        return {
            totalIntake,
            totalAdmitted,
            confirmed,
            allocated,
            pendingDocs,
            applicantsPendingDocs,
            feePending,
            applicantsPendingFee,
            totalApplicants,
            globalQuotaSummary,
            programSummaries,
        };
    }
}
