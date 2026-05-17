import { Router } from 'express';
import { getMyEvents, createEvent, deleteEvent } from './events.controller.js';

const router = Router();

// Auth + role middleware applied at namespace root (college.routes.ts)
// College-specific event management
router.get('/my-events', getMyEvents);
router.post('/', createEvent);
router.delete('/:id', deleteEvent);

export default router;
