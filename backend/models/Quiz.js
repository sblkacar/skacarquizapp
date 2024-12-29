const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'matching', 'fill_blank'],
    required: true
  },
  options: [{
    type: String
  }],
  correctOption: {
    type: Number
  },
  pairs: [{
    left: String,
    right: String
  }],
  blanks: [{
    answer: String
  }]
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'matching', 'fill_in_blank'],
    required: true
  },
  accessCode: {
    type: String,
    unique: true
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Access code oluşturma
quizSchema.pre('save', function(next) {
  if (!this.accessCode) {
    this.accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Quiz', quizSchema); 