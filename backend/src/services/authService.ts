import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

export class AuthService {
    static async seedAdminUser(): Promise<void> {
        const repo = AppDataSource.getRepository(User);
        const count = await repo.count();
        if (count === 0) {
            const passwordHash = await bcrypt.hash('admin123', 10);
            const adminUser = repo.create({
                username: 'admin123@gmail.com',
                passwordHash,
                role: 'ADMIN',
            });
            await repo.save(adminUser);
            console.log('Default ADMIN user seeded: admin/admin123');
        }
    }
}
