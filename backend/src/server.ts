import 'dotenv/config';

// Secure Environment Validation Guard: halt boot-up if vital Supabase keys are missing
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ CRITICAL DEVSECOPS CONFIG FAILURE: Environment variable ${envVar} is missing!`);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ DEVSECOPS WARNING: NODE_ENV is not set to "production". Ensure proper environment context in production deployments.');
}

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

/*
 * 🛡️ BUSINESS LOGIC & THREAT MODEL AUDIT - VERIFICATION SUMMARY
 *
 * 1. WORKFLOW STEP-SKIPPING AUDIT:
 *    - Workflow: Signup -> Login -> Profile/Role Select -> Dashboard Access.
 *    - Threat: Attacker attempts to skip signup/login or bypass profile setup to access inner private dashboards directly.
 *    - Mitigation: Every core route (e.g. /home, /profile, /teams, /discover, /messages) is heavily guarded under 
 *      'authMiddleware' and 'roleMiddleware(['student'])'. If a session or valid profile token is missing,
 *      inner queries will reject unauthorized users at the gateway (status 401/403).
 *
 * 2. INSECURE DIRECT OBJECT REFERENCE (IDOR) AUDIT:
 *    - Threat: Attacker modifies user IDs in payloads or parameter queries to fetch, update, or edit other profiles/teams.
 *    - Mitigation: Inside getMe, getMyTeam, and active messaging feeds, user context is derived strictly from
 *      the decoded cryptographic JWT: '(req as any).user?.id'. It is impossible for an attacker to tamper with parameters
 *      to request other users' private tables or models.
 *
 * 3. TRUSTING FRONTEND PARAMETERS & PRICE MANIPULATION AUDIT:
 *    - Threat: Frontend controls parameters such as fee, payment values, or access tiers.
 *    - Mitigation: Not applicable. No in-app purchasing or payment integration exists. All write controllers
 *      enforce Joi type structure limits, blocking invalid payload formats or excessive input sizes.
 *
 * 4. SYSTEM IDEMPOTENCY & RACE CONDITIONS:
 *    - Mitigation: Read-only GET feeds execute safely without mutating state. POST endpoints are protected by 
 *      underlying Postgres constraints (e.g. unique user constraints, unique membership keys) that reject duplicates.
 */
