import { Router } from 'express';
import { getMyTeam, createTeam } from './teams.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can fetch active student collaboration team spaces
router.get('/my', authMiddleware, roleMiddleware(['student']), getMyTeam);

// Student team creation endpoint
router.post('/', authMiddleware, roleMiddleware(['student']), createTeam);

export default router;
