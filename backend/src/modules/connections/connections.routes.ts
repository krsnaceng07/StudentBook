import { Router } from 'express';
import { 
  sendConnectionRequest, 
  getIncomingRequests, 
  getOutgoingRequests, 
  respondToRequest 
} from './connections.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Secure RBAC: Only student role can manage connections
router.post('/request', authMiddleware, roleMiddleware(['student']), sendConnectionRequest);
router.get('/incoming', authMiddleware, roleMiddleware(['student']), getIncomingRequests);
router.get('/outgoing', authMiddleware, roleMiddleware(['student']), getOutgoingRequests);
router.put('/respond', authMiddleware, roleMiddleware(['student']), respondToRequest);

export default router;
