import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Campus } from './Campus';
import { InstitutionCap } from './InstitutionCap';

@Entity()
export class Institution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @OneToMany(() => Campus, (c) => c.institution)
  campuses: Campus[];

  @OneToMany(() => InstitutionCap, (cap) => cap.institution)
  caps: InstitutionCap[];
}
