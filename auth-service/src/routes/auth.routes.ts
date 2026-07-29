import { Router } from 'express';
import { login } from '../controllers/login.controller';
import { register } from '../controllers/register.controller';
import { googleAuth } from '../controllers/google.controller';
import { getUserStats, updateProfile } from '../controllers/user.controller';
import { getUserSessions, getSessionMessages, createSession, addMessage } from '../controllers/history.controller';

const router = Router();

// Standard Auth Routes
router.post('/register', register);
router.post('/login', login);

// OAuth Routes
router.post('/google', googleAuth);

// User Profile & Stats
router.get('/stats/:userId', getUserStats);
router.put('/profile/:userId', updateProfile);

// Chat History Routes
router.get('/history/:userId', getUserSessions);
router.get('/history/session/:sessionId', getSessionMessages);
router.post('/history/:userId', createSession);
router.post('/history/session/:sessionId/message', addMessage);

export default router;
