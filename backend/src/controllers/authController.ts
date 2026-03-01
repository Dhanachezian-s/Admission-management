import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/userService';

const JWT_SECRET = process.env.JWT_SECRET || 'admission_secret_2026';

export const AuthController = {
    /**
     * POST /auth/login
     * Body: { username, password }
     * Authenticates a user and returns a JWT token for session management.
     */
    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            const user = await UserService.findByUsername(username);

            if (!user || !user.isActive) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role, username: user.username },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            return res.json({ token, role: user.role, username: user.username, userId: user.id });
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * GET /auth/me
     * Returns details of the currently authenticated session user.
     */
    async me(req: Request, res: Response) {
        return res.json((req as any).user);
    }
};
