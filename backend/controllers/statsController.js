const User = require('../models/User');
const Quiz = require('../models/Quiz');

// @desc    Get public statistics
// @route   GET /api/stats/public
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    // Tüm kullanıcıları say (isActive kontrolü olmadan)
    const [totalUsers, totalStudents, totalTeachers, totalQuizzes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Quiz.countDocuments()
    ]);

    // Debug için konsola yazdır
    console.log('İstatistikler:', {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalQuizzes
    });

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalQuizzes
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ 
      message: 'İstatistikler getirilemedi',
      error: error.message 
    });
  }
};

// Detaylı istatistikler için yeni bir endpoint
const getDetailedStats = async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        students: await User.countDocuments({ role: 'student' }),
        teachers: await User.countDocuments({ role: 'teacher' }),
        admins: await User.countDocuments({ role: 'admin' })
      },
      quizzes: {
        total: await Quiz.countDocuments(),
        active: await Quiz.countDocuments({ isActive: true }),
        inactive: await Quiz.countDocuments({ isActive: false })
      }
    };

    console.log('Detaylı istatistikler:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Detaylı istatistik hatası:', error);
    res.status(500).json({ 
      message: 'Detaylı istatistikler getirilemedi',
      error: error.message 
    });
  }
};

module.exports = {
  getPublicStats,
  getDetailedStats
}; 