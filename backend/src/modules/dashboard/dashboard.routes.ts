import { Router } from 'express';
import { getDashboardHome } from './dashboard.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/home', authMiddleware, getDashboardHome);

export default router;
