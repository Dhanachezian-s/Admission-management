import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export const UserController = {
    /**
     * POST /users
     * Body: { username, password, role: 'ADMIN' | 'OFFICER' | 'MANAGEMENT' }
     * Registers a new staff member with a specific role and default active status.
     */
    async createUser(req: Request, res: Response) {
        try {
            const { username, password, role } = req.body;
            const validRoles = ['ADMIN', 'OFFICER', 'MANAGEMENT'];

            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: 'Invalid role provided' });
            }

            const user = await UserService.createUser(username, password, role as any);
            return res.json({ id: user.id, username: user.username, role: user.role });
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    },

    /**
     * GET /users
     * Returns a list of all system users.
     */
    async listUsers(req: Request, res: Response) {
        try {
            const users = await UserService.listUsers();
            return res.json(users);
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    }
};
