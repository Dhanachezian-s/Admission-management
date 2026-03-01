import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Institution } from './Institution';
import { Department } from './Department';

@Entity()
export class Campus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Institution, (i) => i.campuses, { onDelete: 'CASCADE' })
  institution: Institution;

  @OneToMany(() => Department, (d) => d.campus)
  departments: Department[];
}
