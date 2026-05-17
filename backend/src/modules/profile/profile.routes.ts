import { Router } from 'express';
import { getMe, getProfileById } from './profile.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can fetch extended profile details
router.get('/me', authMiddleware, roleMiddleware(['student']), getMe);
router.get('/:id', authMiddleware, roleMiddleware(['student']), getProfileById);

export default router;
