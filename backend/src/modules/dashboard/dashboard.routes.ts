import { Router } from 'express';
import { getDashboardHome } from './dashboard.controller.js';

const router = Router();

// Auth + role middleware applied at namespace root (student.routes.ts)
router.get('/home', getDashboardHome);

export default router;
