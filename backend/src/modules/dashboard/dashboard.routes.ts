import { Router } from 'express';
import { getDashboardHome, getCollegeDashboard } from './dashboard.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can fetch personal dashboard analytics
router.get('/home', authMiddleware, roleMiddleware(['student']), getDashboardHome);

// Secure RBAC: Only college role can fetch college dashboard analytics
router.get('/college', authMiddleware, roleMiddleware(['college']), getCollegeDashboard);

export default router;
