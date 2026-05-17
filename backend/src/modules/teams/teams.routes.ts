import { Router } from 'express';
import { getMyTeam } from './teams.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/my', authMiddleware, getMyTeam);

export default router;
