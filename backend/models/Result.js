const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    questionType: String,
    correctAnswer: mongoose.Schema.Types.Mixed
  }],
  score: {
    type: Number,
    required: true
  },
  correctCount: {
    type: Number,
    required: true
  },
  wrongCount: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Benzersiz quiz-öğrenci kombinasyonunu sağlamak için bileşik indeks
resultSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema); 