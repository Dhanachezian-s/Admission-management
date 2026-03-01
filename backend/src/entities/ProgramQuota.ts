import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Program } from './Program';

export type QuotaType = 'KCET' | 'COMEDK' | 'Management';

@Entity()
@Index(['program', 'quotaType'], { unique: true })
export class ProgramQuota {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Program, (p) => p.quotas, { onDelete: 'CASCADE' })
  program: Program;

  @Column({ type: 'varchar' })
  quotaType: QuotaType;

  @Column()
  seats: number;
}
