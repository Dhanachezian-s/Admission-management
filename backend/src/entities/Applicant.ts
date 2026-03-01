import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Admission } from './Admission';

export type DocumentStatus = 'Pending' | 'Submitted' | 'Verified';
export type FeeStatus = 'Pending' | 'Paid';

@Entity()
export class Applicant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true })
  gender: string;

  @Column()
  category: string;

  @Column()
  entryType: 'Regular' | 'Lateral';

  @Column()
  quotaType: 'KCET' | 'COMEDK' | 'Management';

  @Column({ type: 'varchar', nullable: true })
  allotmentNumber: string | null;

  @Column({ nullable: true })
  marks: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  parentName: string;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  aadhar: string;

  @Column({ type: 'varchar', default: 'Pending' })
  documentStatus: DocumentStatus;

  @Column({ type: 'varchar', default: 'Pending' })
  feeStatus: FeeStatus;

  @OneToMany(() => Admission, (a) => a.applicant)
  admissions: Admission[];
}
