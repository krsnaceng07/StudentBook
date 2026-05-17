import { Router } from 'express';
import { getInbox, getChatHistory } from './messages.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getInbox);
router.get('/:conversationId', authMiddleware, getChatHistory);

export default router;
