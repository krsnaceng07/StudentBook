import { Router } from 'express';
import { getDiscoverUsers } from './discover.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// Protect the route with auth middleware
router.get('/', authMiddleware, getDiscoverUsers);

export default router;
