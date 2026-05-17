import { Router } from 'express';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import collegeDashboardRoutes from '../modules/dashboard/dashboard.college.routes.js';
import collegeEventsRoutes from '../modules/events/events.college.routes.js';

const router = Router();

// Apply auth and college role middleware to ALL college sub-routes
router.use(authMiddleware);
router.use(roleMiddleware(['college']));

// Mount modular sub-routes
router.use('/dashboard', collegeDashboardRoutes);
router.use('/events', collegeEventsRoutes);

export default router;
