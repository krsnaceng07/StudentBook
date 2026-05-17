import { Router } from 'express';
import { getDiscoverUsers } from './discover.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can discover other student collaboration partner profiles
router.get('/', authMiddleware, roleMiddleware(['student']), getDiscoverUsers);

export default router;
