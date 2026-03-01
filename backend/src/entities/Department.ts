import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import { Campus } from './Campus'
import { Program } from './Program'

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Campus, (c) => c.departments, { onDelete: 'CASCADE' })
  campus: Campus;

  @OneToMany(() => Program, (p) => p.department)
  programs: Program[];
}
