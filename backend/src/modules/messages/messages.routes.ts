import { Router } from 'express';
import { getInbox } from './messages.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getInbox);

export default router;
