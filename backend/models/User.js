const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur']
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'teacher', 'student'],
      message: 'Geçersiz kullanıcı rolü. Rol admin, teacher veya student olmalıdır.'
    },
    required: [true, 'Rol alanı zorunludur']
  }
}, {
  timestamps: true
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema); 