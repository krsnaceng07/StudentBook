import { Router } from 'express';
import { getMe, getProfileById, updateProfile } from './profile.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Both student and college roles can fetch profile details
router.get('/me', authMiddleware, roleMiddleware(['student', 'college']), getMe);
router.get('/:id', authMiddleware, roleMiddleware(['student', 'college']), getProfileById);

// Update profile details
router.put('/update', authMiddleware, roleMiddleware(['student', 'college']), updateProfile);

export default router;
