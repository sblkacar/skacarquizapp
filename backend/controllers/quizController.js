const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// @desc    Quiz oluştur
// @route   POST /api/quizzes
// @access  Private/Teacher
const createQuiz = async (req, res) => {
  try {
    const { title, type, questions } = req.body;
    
    // Quiz tipini kontrol et
    if (!type) {
      return res.status(400).json({ message: 'Quiz tipi gereklidir' });
    }

    const quiz = new Quiz({
      title,
      type, // Quiz tipini ekle
      questions: questions.map(q => ({
        ...q,
        type: q.type || type // Her soru için tip belirt
      })),
      createdBy: req.user._id
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.warn(error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Öğretmenin quizlerini getir
// @route   GET /api/quizzes
// @access  Private/Teacher
const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .sort('-createdAt');

    // Her quiz için katılımcı sayısını hesapla
    const quizzesWithStats = await Promise.all(quizzes.map(async (quiz) => {
      const participantCount = await Result.countDocuments({ quiz: quiz._id });
      return {
        ...quiz.toObject(),
        participantCount
      };
    }));

    res.json(quizzesWithStats);
  } catch (error) {
    console.error('Quiz getirme hatası:', error);
    res.status(500).json({ message: 'Quizler getirilemedi' });
  }
};

// @desc    Quiz'i ID'ye göre getir
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz bulunamadı' });
    }

    // Quiz verisini doğrula ve formatla
    const formattedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      type: quiz.type,
      isActive: quiz.isActive,
      questions: quiz.questions.map(q => {
        const baseQuestion = {
          _id: q._id,
          text: q.text,
          type: q.type || quiz.type
        };

        switch (q.type || quiz.type) {
          case 'multiple_choice':
            return {
              ...baseQuestion,
              options: q.options || [],
              correctOption: q.correctOption
            };

          case 'matching':
            return {
              ...baseQuestion,
              pairs: q.pairs || []
            };

          case 'fill_blank':
            return {
              ...baseQuestion,
              blanks: q.blanks || []
            };

          default:
            return baseQuestion;
        }
      }),
      createdAt: quiz.createdAt,
      createdBy: quiz.createdBy
    };

    // Debug için
    console.log('Gönderilen quiz verisi:', JSON.stringify(formattedQuiz, null, 2));

    res.json(formattedQuiz);
  } catch (error) {
    console.error('Quiz getirme hatası:', error);
    res.status(500).json({ message: 'Quiz getirilemedi' });
  }
};

// @desc    Quiz'i erişim koduyla getir
// @route   GET /api/quizzes/access/:code
// @access  Private/Student
const getQuizByAccessCode = async (req, res) => {
  try {
    console.log('Aranan erişim kodu:', req.params.code); // Debug log
    console.log('İstek yapan kullanıcı:', req.user); // Debug log

    // Erişim kodunu büyük harfe çevir ve boşlukları temizle
    const accessCode = req.params.code.trim().toUpperCase();

    const quiz = await Quiz.findOne({ 
      accessCode: accessCode,
      isActive: true 
    });
    
    console.log('Bulunan quiz:', quiz); // Debug log
    
    if (!quiz) {
      return res.status(404).json({ 
        message: 'Quiz bulunamadı veya aktif değil',
        searchedCode: accessCode 
      });
    }

    // Quiz'i JSON formatında gönder
    res.json({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      accessCode: quiz.accessCode,
      isActive: quiz.isActive
    });

  } catch (error) {
    console.error('Quiz erişim hatası:', error); // Debug log
    res.status(500).json({ 
      message: 'Quiz getirilemedi',
      error: error.message 
    });
  }
};

// @desc    Quiz'i güncelle
// @route   PUT /api/quizzes/:id
// @access  Private/Teacher
const updateQuiz = async (req, res) => {
  try {
    const { title, type, questions } = req.body;
    
    // Quiz tipini kontrol et
    if (!type) {
      return res.status(400).json({ message: 'Quiz tipi gereklidir' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz bulunamadı' });
    }

    // Yetki kontrolü
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu quizi düzenleme yetkiniz yok' });
    }

    quiz.title = title;
    quiz.type = type;
    quiz.questions = questions.map(q => ({
      ...q,
      type: q.type || type // Her soru için tip belirt
    }));

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Quiz'i sil
// @route   DELETE /api/quizzes/:id
// @access  Private/Teacher
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz bulunamadı' });
    }

    // Quiz'in sahibi olduğunu kontrol et
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await quiz.remove();
    res.json({ message: 'Quiz silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Quiz silinemedi' });
  }
};

// @desc    Quiz cevaplarını kaydet
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz bulunamadı' });
    }

    const { answers } = req.body;

    // Debug için gelen cevapları logla
    console.log('Gelen cevaplar:', answers);
    console.log('Quiz soruları:', quiz.questions);

    // Cevapları kontrol et ve puanı hesapla
    let correctCount = 0;
    let wrongCount = 0;
    const checkedAnswers = quiz.questions.map((question, index) => {
      let isCorrect = false;
      const userAnswer = answers[index];

      console.log(`Soru ${index + 1} kontrolü:`, {
        type: question.type,
        userAnswer,
        correctAnswer: question.type === 'multiple_choice' ? question.correctOption : 
                      question.type === 'matching' ? question.pairs : 
                      question.blanks
      });

      switch (question.type) {
        case 'multiple_choice':
          isCorrect = typeof userAnswer === 'number' && userAnswer === question.correctOption;
          break;

        case 'matching':
          if (Array.isArray(userAnswer) && userAnswer.length === question.pairs.length) {
            isCorrect = userAnswer.every((answer, pairIndex) => 
              parseInt(answer) === pairIndex
            );
          }
          break;

        case 'fill_blank':
          if (Array.isArray(userAnswer) && userAnswer.length === question.blanks.length) {
            isCorrect = userAnswer.every((answer, blankIndex) => 
              answer.toLowerCase().trim() === question.blanks[blankIndex].answer.toLowerCase().trim()
            );
          }
          break;
      }

      // Doğru/yanlış sayılarını güncelle
      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      console.log(`Soru ${index + 1} sonucu:`, { 
        isCorrect, 
        correctCount,
        wrongCount,
        totalQuestions: quiz.questions.length
      });

      return {
        questionIndex: index,
        selectedAnswer: userAnswer,
        isCorrect,
        questionType: question.type,
        correctAnswer: question.type === 'multiple_choice' ? question.correctOption :
                      question.type === 'matching' ? question.pairs :
                      question.blanks
      };
    });

    const score = (correctCount / quiz.questions.length) * 100;

    console.log('Quiz değerlendirme sonucu:', {
      totalQuestions: quiz.questions.length,
      correctCount,
      wrongCount,
      score,
      checkedAnswers
    });

    // Sonucu kaydet
    const result = await Result.create({
      quiz: quiz._id,
      student: req.user._id,
      answers: checkedAnswers,
      score,
      correctCount,
      wrongCount,
      totalQuestions: quiz.questions.length,
      completedAt: new Date()
    });

    // Sonucu detaylı bilgilerle birlikte getir
    const populatedResult = await Result.findById(result._id)
      .populate('quiz')
      .populate('student', 'name email');

    res.status(201).json({
      message: 'Quiz tamamlandı',
      result: populatedResult
    });

  } catch (error) {
    console.error('Quiz submit hatası:', error);
    res.status(500).json({ 
      message: 'Quiz sonucu kaydedilemedi',
      error: error.message 
    });
  }
};

// @desc    Öğretmenin quiz istatistiklerini getir
// @route   GET /api/quizzes/stats
// @access  Private/Teacher
const getTeacherStats = async (req, res) => {
  try {
    // Öğretmenin tüm quizlerini bul
    const quizzes = await Quiz.find({ createdBy: req.user._id });
    
    // Tüm quiz ID'lerini al
    const quizIds = quizzes.map(quiz => quiz._id);
    
    // Bu quizlere ait tüm sonuçları bul
    const results = await Result.find({ quiz: { $in: quizIds } });
    
    // İstatistikleri hesapla
    const stats = {
      totalQuizzes: quizzes.length,
      activeQuizzes: quizzes.filter(quiz => quiz.isActive).length,
      totalParticipants: results.length,
      averageScore: results.length > 0 
        ? Math.round(
            results.reduce((acc, result) => {
              // Her sonuç için yüzdelik başarı oranını hesapla
              const percentageScore = (result.correctCount / result.totalQuestions) * 100;
              return acc + percentageScore;
            }, 0) / results.length
          )
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ message: 'İstatistikler getirilemedi' });
  }
};

// @desc    Quiz'e katıl
// @route   POST /api/quizzes/join
// @access  Private/Student
const joinQuiz = async (req, res) => {
  try {
    const { accessCode } = req.body;

    // Debug için
    console.log('Join Quiz attempt:', { 
      accessCode,
      userId: req.user._id,
      userRole: req.user.role 
    });

    // Erişim kodu formatını kontrol et
    if (!accessCode || !/^[A-Z0-9]{6}$/.test(accessCode)) {
      return res.status(400).json({ 
        message: 'Geçersiz erişim kodu formatı' 
      });
    }

    // Quiz'i bul
    const quiz = await Quiz.findOne({ 
      accessCode,
      isActive: true 
    });

    if (!quiz) {
      return res.status(404).json({ 
        message: 'Quiz bulunamadı veya aktif değil' 
      });
    }

    // Debug için
    console.log('Quiz found:', { 
      quizId: quiz._id,
      title: quiz.title 
    });

    res.json({
      message: 'Quiz\'e başarıyla katıldınız',
      quizId: quiz._id
    });

  } catch (error) {
    console.error('Quiz join error:', error);
    res.status(500).json({ 
      message: 'Quiz\'e katılma başarısız',
      error: error.message 
    });
  }
};

// @desc    Quiz durumunu değiştir (aktif/pasif)
// @route   PATCH /api/quizzes/:id/toggle-status
// @access  Private/Teacher
const toggleQuizStatus = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz bulunamadı' });
    }

    // Quiz'in sahibi olduğunu kontrol et
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    quiz.isActive = req.body.isActive;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Quiz durum değiştirme hatası:', error);
    res.status(500).json({ message: 'Quiz durumu değiştirilemedi' });
  }
};

// @desc    Quiz sonuçlarını getir
// @route   GET /api/quizzes/:id/results
// @access  Private/Teacher
const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz bulunamadı' });
    }

    // Yetki kontrolü
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu quizin sonuçlarını görme yetkiniz yok' });
    }

    // Tüm sonuçları getir
    const results = await Result.find({ quiz: req.params.id })
      .populate('student', 'name email')
      .sort('-completedAt');

    console.log('Bulunan sonuçlar:', results);

    // İstatistikleri hesapla
    const stats = {
      totalParticipants: await Result.countDocuments({ quiz: req.params.id }),
      averageScore: results.length > 0
        ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length)
        : 0,
      totalAttempts: results.length,
      totalQuestions: quiz.questions.length
    };

    const formattedResults = results.map(result => ({
      _id: result._id,
      student: result.student,
      score: Math.round(result.score),
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      completedAt: result.completedAt
    }));

    console.log('Formatlanmış sonuçlar:', formattedResults);

    res.json({
      quiz,
      results: formattedResults,
      stats
    });

  } catch (error) {
    console.error('Quiz sonuçları getirme hatası:', error);
    res.status(500).json({ message: 'Quiz sonuçları getirilemedi' });
  }
};

module.exports = {
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
}; 