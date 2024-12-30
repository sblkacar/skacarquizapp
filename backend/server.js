require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
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

// Connect to database
connectDB();

// Base API route
const apiRouter = express.Router();

// Mount routes on API router
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/quizzes', require('./routes/quizRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/results', require('./routes/resultRoutes'));
apiRouter.use('/admin', require('./routes/adminRoutes'));
apiRouter.use('/students', require('./routes/studentRoutes'));
apiRouter.use('/stats', require('./routes/statsRoutes'));

// Health check on API router
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Mount API router at /api
app.use('/api', apiRouter);

// Root health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
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

module.exports = app; 