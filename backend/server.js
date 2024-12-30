require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: ['https://quiz-app-sibel.netlify.app', /\.netlify\.app$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parser
app.use(express.json());

// MongoDB connection with error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Base API route
const apiRouter = express.Router();

try {
  // Mount routes on API router
  apiRouter.use('/auth', require('./routes/authRoutes'));
  apiRouter.use('/quizzes', require('./routes/quizRoutes'));
  apiRouter.use('/users', require('./routes/userRoutes'));
  apiRouter.use('/results', require('./routes/resultRoutes'));
  apiRouter.use('/admin', require('./routes/adminRoutes'));
  apiRouter.use('/students', require('./routes/studentRoutes'));
  apiRouter.use('/stats', require('./routes/statsRoutes'));
} catch (error) {
  console.error('Error loading routes:', error);
}

// Health check on API router
apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount API router at /api
app.use('/api', apiRouter);

// Root health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    env: process.env.NODE_ENV
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    error: true,
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Export the Express app
module.exports = app; 