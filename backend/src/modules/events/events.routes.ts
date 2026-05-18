import { Router } from 'express';
import { 
  getEvents, 
  getMyEvents, 
  createEvent, 
  deleteEvent, 
  getEventById, 
  bookmarkEvent, 
  unbookmarkEvent,
  registerForEvent,
  unregisterFromEvent
} from './events.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = Router();

// College specific event management
router.get('/my-events', authMiddleware, roleMiddleware(['college']), getMyEvents);
router.post('/', authMiddleware, roleMiddleware(['college']), createEvent);

// Publicly available (but authenticated) list of events
router.get('/', authMiddleware, getEvents);

// Get specific event detail by ID
router.get('/:id', authMiddleware, getEventById);
router.delete('/:id', authMiddleware, roleMiddleware(['college']), deleteEvent);

// Student-specific event bookmarking endpoints
router.post('/:id/bookmark', authMiddleware, roleMiddleware(['student']), bookmarkEvent);
router.delete('/:id/bookmark', authMiddleware, roleMiddleware(['student']), unbookmarkEvent);

// Student-specific event registration endpoints
router.post('/:id/register', authMiddleware, roleMiddleware(['student']), registerForEvent);
router.delete('/:id/register', authMiddleware, roleMiddleware(['student']), unregisterFromEvent);

export default router;
