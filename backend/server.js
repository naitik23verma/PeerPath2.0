const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const doubtRoutes = require('./routes/doubts');
const locationRoutes = require('./routes/location');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
console.log('=== ATTEMPTING DATABASE CONNECTION ===');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'MONGODB_URI is not set');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('=== DATABASE CONNECTION SUCCESSFUL ===');
  console.log('Connected to MongoDB');
  console.log('Database name:', mongoose.connection.name);
  console.log('Database host:', mongoose.connection.host);
  console.log('Database port:', mongoose.connection.port);
})
.catch(err => {
  console.error('=== DATABASE CONNECTION ERROR ===');
  console.error('MongoDB connection error:', err);
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io for real-time chat and WebRTC signaling
io.on('connection', (socket) => {
  console.log('=== WEBSOCKET CONNECTION ===');
  console.log('User connected:', socket.id);

  // Join a chat room
  socket.on('join_room', (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    console.log('Active rooms:', Array.from(socket.rooms));
  });

  // WebRTC: Join a video call room
  socket.on('join-call-room', (roomId) => {
    socket.join(roomId);
    // Notify other users in the room
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // WebRTC: Signal exchange
  socket.on('signal', ({ roomId, signal, to }) => {
    socket.to(to).emit('signal', { signal, from: socket.id });
  });

  // Handle chat messages
  socket.on('message', (data) => {
    const { roomId, message } = data;
    console.log(`=== MESSAGE RECEIVED ===`);
    console.log(`Room: ${roomId}`);
    console.log(`Message content: ${message.content}`);
    console.log(`Sender: ${message.senderName}`);
    console.log(`Receiver: ${message.receiverName}`);
    
    // Broadcast message to all users in the room except sender
    socket.to(roomId).emit('message', { type: 'message', message });
    console.log(`Message broadcasted to room ${roomId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId, userId, isTyping } = data;
    console.log(`User ${userId} ${isTyping ? 'started' : 'stopped'} typing in room ${roomId}`);
    socket.to(roomId).emit('typing', { type: 'typing', userId, isTyping });
  });

  // Handle video call requests (legacy, can be removed if using WebRTC)
  socket.on('video_call_request', (data) => {
    const { roomId, fromUserId, toUserId } = data;
    console.log(`Video call request from ${fromUserId} to ${toUserId} in room ${roomId}`);
    socket.to(roomId).emit('video_call_request', { 
      type: 'video_call_request', 
      fromUserId, 
      toUserId 
    });
  });

  socket.on('disconnect', () => {
    console.log('=== WEBSOCKET DISCONNECTION ===');
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 