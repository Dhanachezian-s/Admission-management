import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Program } from './Program';

@Entity()
export class AcademicYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  year: number;

  @OneToMany(() => Program, (p) => p.academicYear)
  programs: Program[];
}
