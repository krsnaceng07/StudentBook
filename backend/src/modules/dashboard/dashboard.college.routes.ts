import { Router } from 'express';
import { getCollegeDashboard } from './dashboard.controller.js';

const router = Router();

// Auth + role middleware applied at namespace root (college.routes.ts)
router.get('/', getCollegeDashboard);

export default router;
