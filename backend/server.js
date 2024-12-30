require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Debug için
console.log('Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV
});

// Route imports
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');
const resultRoutes = require('./routes/resultRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Connect to database
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://quiz-app-sibel.netlify.app', /\.netlify\.app$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Export for Vercel
module.exports = app;

// Start server if not in production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} 