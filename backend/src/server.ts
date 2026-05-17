import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes.js';
import homeRoutes from './modules/home/home.routes.js';
import discoverRoutes from './modules/discover/discover.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import teamsRoutes from './modules/teams/teams.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Secure Network Headers using Helmet
app.use(helmet());

// 2. Strict CORS Configuration: block wildcard access
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser requests (mobile clients, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const isLocal = origin.startsWith('http://localhost') || 
                    origin.startsWith('http://127.0.0.1') || 
                    origin.startsWith('http://192.168.');
    if (isLocal) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS security boundaries'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
app.use(express.json());

// 3. Rate Limiting Middlewares to defend against brute-force and DDoS
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 attempts
  message: { success: false, error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general API rate limiter globally to all API routes
app.use('/api/v1', generalLimiter);

// Public & Guarded Routes
app.use('/api/v1/auth', authLimiter, authRoutes); // Double-protect auth routes with stricter brute-force limiters
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
