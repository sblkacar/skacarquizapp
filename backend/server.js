const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Routes
const setupRoutes = () => {
  const apiRouter = express.Router();
  
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  apiRouter.use('/auth', require('./routes/authRoutes'));
  apiRouter.use('/quizzes', require('./routes/quizRoutes'));
  apiRouter.use('/users', require('./routes/userRoutes'));
  apiRouter.use('/results', require('./routes/resultRoutes'));
  apiRouter.use('/admin', require('./routes/adminRoutes'));
  apiRouter.use('/students', require('./routes/studentRoutes'));
  apiRouter.use('/stats', require('./routes/statsRoutes'));

  return apiRouter;
};

// Initialize app
const init = async () => {
  await connectDB();
  app.use('/api', setupRoutes());
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
};

// Start the app
init().catch(console.error);

module.exports = app; 