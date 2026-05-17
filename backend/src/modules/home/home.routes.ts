import { Router } from 'express';
import { getHomeData } from './home.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// Protect the route with auth middleware if needed
// Assuming we want only logged-in users to fetch home data
router.get('/', authMiddleware, getHomeData);

export default router;
