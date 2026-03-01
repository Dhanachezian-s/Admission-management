import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

router.post('/', UserController.createUser);
router.get('/', UserController.listUsers);

export default router;
