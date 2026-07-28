import { Router } from 'express';
import { googleAuth, register, login } from '../controllers/auth.controller';

const router = Router();

// Standard Auth Routes
router.post('/register', register);
router.post('/login', login);

// OAuth Routes
router.post('/google', googleAuth);

export default router;
