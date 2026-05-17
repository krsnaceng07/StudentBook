import { Router } from 'express';
import { getHomeData } from './home.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can fetch home feed suggested teammates/activity details
router.get('/', authMiddleware, roleMiddleware(['student']), getHomeData);

export default router;
