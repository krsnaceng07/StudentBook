import { Router } from 'express';
import { getEvents, getMyEvents, createEvent, deleteEvent } from './events.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// Publicly available (but authenticated) list of events
router.get('/', authMiddleware, getEvents);

// College specific event management
router.get('/my-events', authMiddleware, roleMiddleware(['college']), getMyEvents);
router.post('/', authMiddleware, roleMiddleware(['college']), createEvent);
router.delete('/:id', authMiddleware, roleMiddleware(['college']), deleteEvent);

export default router;
