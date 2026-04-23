require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const http = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const matchRoutes = require('./routes/matchRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const teamRoutes = require('./routes/teamRoutes');
const postRoutes = require('./routes/postRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_ORIGIN || false  // Lock to specific origin in production
      : '*',  // Allow all in development
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Pass io to global for controllers
global.io = io;

// Request logging silenced in Phase 1 Security Hardening

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, 
});
app.use('/api/', limiter);

// Stricter limiter for Chat and Auth
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/v1/auth/login', strictLimiter);
app.use('/api/v1/auth/register', strictLimiter);
app.use('/api/v1/chat', strictLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/match', matchRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/notifications', notificationRoutes);

const Team = require('./models/Team');

// Socket.io Lifecycle
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    // Join private room for 1:1 chats
    socket.join(userId);
    socket.join(userId);

    // Join rooms for all teams the user belongs to
    joinTeamRooms(socket, userId);

    // Client can request to re-sync team rooms (e.g. after joining a new team)
    socket.on('sync_team_rooms', () => {
      joinTeamRooms(socket, userId);
    });
  }

    socket.on('disconnect', () => {
    });
});

async function joinTeamRooms(socket, userId) {
  try {
    const mongoose = require('mongoose');
    const uId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    
    const teams = await Team.find({ 'members.user': uId });
    teams.forEach(team => {
      socket.join(`team_${team._id}`);
      socket.join(`team_${team._id}`);
    });
  } catch (err) {
    console.error('[Socket Error] joinTeamRooms:', err);
  }
}

// Root route
app.get('/', (req, res) => {
  res.send('StudentSociety API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
