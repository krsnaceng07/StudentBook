import { Router } from 'express';
import { getDashboardHome } from './dashboard.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can fetch personal dashboard analytics
router.get('/home', authMiddleware, roleMiddleware(['student']), getDashboardHome);

export default router;
