import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Applicant } from './Applicant';
import { Program } from './Program';
import { QuotaType } from './ProgramQuota';

export type AdmissionStatus = 'Allocated' | 'Confirmed';

@Entity()
@Index(['applicant', 'program'], { unique: true })
export class Admission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Applicant, (a) => a.admissions, { onDelete: 'CASCADE' })
  applicant: Applicant;

  @ManyToOne(() => Program, (p) => p.admissions, { onDelete: 'CASCADE' })
  program: Program;

  @Column({ type: 'varchar' })
  quotaType: QuotaType;

  @Column({ type: 'varchar', default: 'Allocated' })
  status: AdmissionStatus;

  @Column({ type: 'varchar', unique: true, nullable: true })
  admissionNumber: string | null;
}
