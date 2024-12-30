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
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://quiz-app-sibel.netlify.app',
        'https://skacarquizapp.netlify.app',
        /\.netlify\.app$/, // Tüm Netlify preview URL'lerini kabul et
        /netlify\.app$/    // Alternatif pattern
      ]
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200 // 204 yerine 200 döndür
}));

// Preflight istekleri için özel handler
app.options('*', (req, res) => {
  res.status(200).end();
});

// Body parser
app.use(express.json());

// Hata ayıklama middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Routes
const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/quizzes', quizRoutes);
router.use('/users', userRoutes);
router.use('/results', resultRoutes);
router.use('/admin', adminRoutes);
router.use('/students', studentRoutes);
router.use('/stats', statsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quiz App API is running' });
});

// Ana router'ı uygulama seviyesinde kullan
app.use('/', router);

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.path);
  res.status(404).json({ 
    error: true, 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Port ayarı
const PORT = process.env.PORT || 5003;

// Vercel için export
module.exports = app;

// Development için
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} 