import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type UserRole = 'ADMIN' | 'OFFICER' | 'MANAGEMENT';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', unique: true })
    username: string;

    @Column()
    passwordHash: string;

    @Column({ type: 'varchar' })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;
}
