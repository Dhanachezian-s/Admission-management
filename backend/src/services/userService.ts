import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

export class UserService {
    static async createUser(username: string, passwordPlain: string, role: UserRole): Promise<User> {
        const repo = AppDataSource.getRepository(User);

        const existing = await repo.findOne({ where: { username } });
        if (existing) {
            throw new Error('Username already exists');
        }

        const passwordHash = await bcrypt.hash(passwordPlain, 10);
        const user = repo.create({ username, passwordHash, role });
        await repo.save(user);

        return user;
    }

    static async findByUsername(username: string): Promise<User | null> {
        const repo = AppDataSource.getRepository(User);
        return repo.findOne({ where: { username } });
    }

    static async listUsers(): Promise<User[]> {
        const repo = AppDataSource.getRepository(User);
        return repo.find({ select: ['id', 'username', 'role', 'isActive'] });
    }
}
