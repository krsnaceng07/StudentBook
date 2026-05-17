import { Router } from 'express';
import { getNotifications } from './notifications.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getNotifications);

export default router;
