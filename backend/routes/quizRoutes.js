const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getTeacherQuizzes,
  getQuizById,
  getQuizByAccessCode,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getTeacherStats,
  joinQuiz,
  toggleQuizStatus,
  getQuizResults
} = require('../controllers/quizController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Debug middleware
router.use((req, res, next) => {
  console.log('Quiz Route:', {
    method: req.method,
    path: req.path,
    token: req.headers.authorization,
    user: req.user,
    userId: req.user?._id
  });
  next();
});

// Protect middleware'ini en başta uygula
router.use(protect);

// İstatistikler route'u - En üstte olmalı
router.get('/stats', protect, teacherOnly, getTeacherStats);

// Öğrenci route'u
router.get('/access/:code', protect, checkRole('student'), getQuizByAccessCode);

// Quiz'e katılma route'u
router.post('/join', checkRole('student'), joinQuiz);

// Quiz sonuçları route'unu ekleyelim (diğer route'lardan önce)
router.get('/:id/results', protect, getQuizResults);

// Öğretmen route'ları
router.route('/')
  .post(protect, checkRole('teacher'), createQuiz)
  .get(protect, checkRole('teacher'), getTeacherQuizzes);

// Quiz submit route'u
router.post('/:id/submit', protect, checkRole('student'), submitQuiz);

// ID'ye göre işlemler en sonda olmalı
router.route('/:id')
  .get(protect, getQuizById)
  .put(protect, checkRole('teacher'), updateQuiz)
  .delete(protect, checkRole('teacher'), deleteQuiz);

// Quiz durumunu değiştir route'u
router.patch('/:id/toggle-status', protect, checkRole('teacher'), toggleQuizStatus);

module.exports = router; 