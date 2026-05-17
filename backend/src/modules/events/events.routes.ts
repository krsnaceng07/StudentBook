import { Router } from 'express';
import { getEvents } from './events.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getEvents);

export default router;
