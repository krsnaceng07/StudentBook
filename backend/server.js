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
const settingsRoutes = require('./routes/settingsRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_ORIGIN || false 
      : '*', 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Pass io to global for controllers
global.io = io;

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, 
});
app.use('/api/', limiter);

// Stricter limiter for Auth
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Moderate limiter for Chat (higher frequency)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many chat requests, slowing down...' }
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/reset-password', authLimiter);
app.use('/api/v1/chat', chatLimiter);

// Body parser - Reduced limit for security
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/search', searchRoutes);

const Team = require('./models/Team');
const Conversation = require('./models/Conversation');

const jwt = require('jsonwebtoken');

const onlineUsers = new Map(); // userId -> socketId

// Socket.io Lifecycle
io.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  let userId;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.log('[Socket Auth Error] Invalid token');
      return socket.disconnect();
    }
  }

  if (userId) {
    const sUserId = userId.toString();
    onlineUsers.set(sUserId, socket.id);

    // Join private room for 1:1 user alerts (backwards compatibility)
    socket.join(sUserId);

    // Join rooms for all conversations (both personal and team)
    joinUserRooms(socket, sUserId);

    // Broadcast online status
    socket.broadcast.emit('user_online', { userId: sUserId });

    // Client can request to re-sync rooms
    socket.on('sync_rooms', () => {
      joinUserRooms(socket, sUserId);
    });

    // Handle Typing Indicators
    socket.on('typing', ({ conversationId, name }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        conversationId,
        userId: sUserId,
        name
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('stop_typing', {
        conversationId,
        userId: sUserId
      });
    });

    socket.on('message_seen', ({ conversationId, messageId }) => {
      socket.to(`conv_${conversationId}`).emit('message_seen', {
        conversationId,
        messageId,
        userId: sUserId
      });
    });

    socket.on('message_reaction', ({ conversationId, messageId, emoji, action }) => {
      socket.to(`conv_${conversationId}`).emit('message_reaction', {
        conversationId,
        messageId,
        userId: sUserId,
        emoji,
        action // 'add' or 'remove'
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(sUserId);
      socket.broadcast.emit('user_offline', { userId: sUserId });
      console.log(`[Socket] User ${sUserId} disconnected.`);
    });

  } else {
    socket.disconnect();
  }
});

async function joinUserRooms(socket, userId) {
  try {
    const mongoose = require('mongoose');
    const uId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    
    // 1. Join all Conversation rooms
    const conversations = await Conversation.find({ participants: uId });
    conversations.forEach(conv => {
      socket.join(`conv_${conv._id}`);
    });

    // 2. Join Team rooms
    const teams = await Team.find({ 'members.user': uId });
    teams.forEach(team => {
      socket.join(`team_${team._id}`);
      // Also join a conversation-style room for teams if they have one
      socket.join(`conv_${team._id}`); // We often use teamId as convId for simplicity
    });

    console.log(`[Socket] User ${userId} joined ${conversations.length} conversation rooms and ${teams.length} team rooms.`);
  } catch (err) {
    console.error('[Socket Error] joinUserRooms:', err);
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

const runningServer = server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

runningServer.timeout = 120000; // 2 minutes for large uploads
