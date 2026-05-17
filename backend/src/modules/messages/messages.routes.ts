import { Router } from 'express';
import { getInbox, getChatHistory, sendMessage } from './messages.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can query chat inbox and details
router.get('/', authMiddleware, roleMiddleware(['student']), getInbox);
router.post('/send', authMiddleware, roleMiddleware(['student']), sendMessage);
router.get('/:conversationId', authMiddleware, roleMiddleware(['student']), getChatHistory);

export default router;
