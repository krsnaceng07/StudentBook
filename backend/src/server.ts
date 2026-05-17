import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import homeRoutes from './modules/home/home.routes.js';
import discoverRoutes from './modules/discover/discover.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import teamsRoutes from './modules/teams/teams.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { roleMiddleware } from './middleware/role.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/home', homeRoutes);
app.use('/api/v1/discover', discoverRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/teams', teamsRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CollabSpace Backend (TS) running on port ${PORT}`);
});
