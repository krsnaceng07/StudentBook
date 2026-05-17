import { Router } from 'express';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import homeRoutes from '../modules/home/home.routes.js';
import discoverRoutes from '../modules/discover/discover.routes.js';
import messagesRoutes from '../modules/messages/messages.routes.js';
import teamsRoutes from '../modules/teams/teams.routes.js';
import connectionsRoutes from '../modules/connections/connections.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = Router();

// Apply auth and student role middleware to ALL student sub-routes
router.use(authMiddleware);
router.use(roleMiddleware(['student']));

// Mount modular sub-routes
router.use('/home', homeRoutes);
router.use('/discover', discoverRoutes);
router.use('/messages', messagesRoutes);
router.use('/teams', teamsRoutes);
router.use('/connections', connectionsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
