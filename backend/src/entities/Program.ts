import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Department } from './Department';
import { AcademicYear } from './AcademicYear';
import { ProgramQuota } from './ProgramQuota';
import { Admission } from './Admission';

export type CourseType = 'UG' | 'PG';
export type EntryType = 'Regular' | 'Lateral';
export type AdmissionMode = 'Government' | 'Management';

@Entity()
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: false })
  code: string;

  @ManyToOne(() => Department, (d) => d.programs, { onDelete: 'CASCADE' })
  department: Department;

  @ManyToOne(() => AcademicYear, (ay) => ay.programs, { onDelete: 'CASCADE' })
  academicYear: AcademicYear;

  @Column({ type: 'varchar' })
  courseType: CourseType;

  @Column({ type: 'varchar' })
  entryType: EntryType;

  @Column({ type: 'varchar' })
  admissionMode: AdmissionMode;

  @Column()
  intake: number;

  @Column({ default: 0 })
  supernumerarySeats: number;

  @OneToMany(() => ProgramQuota, (pq) => pq.program)
  quotas: ProgramQuota[];

  @OneToMany(() => Admission, (a) => a.program)
  admissions: Admission[];
}
