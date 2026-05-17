import { Router } from 'express';
import { getMyTeam } from './teams.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can fetch active student collaboration team spaces
router.get('/my', authMiddleware, roleMiddleware(['student']), getMyTeam);

export default router;
