import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Institution } from './Institution';

@Entity()
export class InstitutionCap {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Institution, (i) => i.caps, { onDelete: 'CASCADE' })
  institution: Institution;

  @Column({ unique: false })
  categoryCode: string;

  @Column()
  capLimit: number;
}
