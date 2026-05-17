import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import homeRoutes from './modules/home/home.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { roleMiddleware } from './middleware/role.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/home', homeRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CollabSpace Backend (TS) running on port ${PORT}`);
});
