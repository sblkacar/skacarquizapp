const Result = require('../models/Result');

// @desc    Öğrenci istatistiklerini getir
// @route   GET /api/students/stats
// @access  Private/Student
const getStudentStats = async (req, res) => {
  try {
    // Tüm sonuçları getir ve quiz detaylarını dahil et
    const results = await Result.find({ student: req.user._id })
      .populate({
        path: 'quiz',
        select: 'title questions'
      });

    // Sonuçlar varsa istatistikleri hesapla
    if (results.length > 0) {
      // Her quiz için detaylı analiz
      const quizAnalytics = results.map(result => {
        const totalQuestions = result.quiz.questions.length;
        const correctAnswers = result.answers.filter(a => a.isCorrect).length;
        return {
          score: result.score,
          correctAnswers,
          totalQuestions,
          date: result.completedAt
        };
      });

      const stats = {
        totalQuizzes: results.length,
        averageScore: Number((quizAnalytics.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1)),
        highestScore: Math.max(...quizAnalytics.map(r => r.score)),
        successfulQuizzes: quizAnalytics.filter(r => r.score >= 50).length,
        totalQuestions: quizAnalytics.reduce((acc, curr) => acc + curr.totalQuestions, 0),
        totalCorrectAnswers: quizAnalytics.reduce((acc, curr) => acc + curr.correctAnswers, 0),
        lastQuizDate: new Date(Math.max(...quizAnalytics.map(r => new Date(r.date)))).toLocaleDateString(),
        recentScores: quizAnalytics
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(r => r.score)
      };

      res.json(stats);
    } else {
      // Hiç quiz sonucu yoksa varsayılan değerler
      res.json({
        totalQuizzes: 0,
        averageScore: 0,
        highestScore: 0,
        successfulQuizzes: 0,
        totalQuestions: 0,
        totalCorrectAnswers: 0,
        lastQuizDate: null,
        recentScores: []
      });
    }

  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ 
      message: 'İstatistikler getirilemedi',
      error: error.message 
    });
  }
};

// @desc    Öğrencinin son quiz sonuçlarını getir
// @route   GET /api/students/results
// @access  Private/Student
const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate({
        path: 'quiz',
        select: 'title questions'
      })
      .sort('-completedAt')
      .limit(10);

    // Sonuçları daha detaylı formatta gönder
    const formattedResults = results.map(result => ({
      _id: result._id,
      quiz: {
        _id: result.quiz._id,
        title: result.quiz.title,
        totalQuestions: result.quiz.questions.length
      },
      score: Number(result.score.toFixed(1)),
      correctAnswers: result.answers.filter(a => a.isCorrect).length,
      completedAt: result.completedAt,
      status: result.score >= 50 ? 'Başarılı' : 'Başarısız'
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Sonuç getirme hatası:', error);
    res.status(500).json({ 
      message: 'Sonuçlar getirilemedi',
      error: error.message 
    });
  }
};

module.exports = {
  getStudentStats,
  getStudentResults
}; 