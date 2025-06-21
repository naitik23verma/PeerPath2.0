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

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
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