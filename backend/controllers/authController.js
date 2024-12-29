const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Token oluşturma fonksiyonu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Lütfen email ve şifre giriniz' 
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email }).select('+password');
    console.log('Found user:', { email: user?.email, role: user?.role }); // Debug için

    if (!user) {
      return res.status(401).json({ 
        message: 'Geçersiz email veya şifre' 
      });
    }

    // Şifre kontrolü
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Geçersiz email veya şifre' 
      });
    }

    // Token oluştur
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Token'ı localStorage'a kaydet
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Giriş yapılırken bir hata oluştu',
      error: error.message 
    });
  }
};

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // E-posta kontrolü
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Rol kontrolü
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Geçersiz rol' });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ 
      message: 'Kayıt işlemi başarısız',
      error: error.message 
    });
  }
};

// @desc    Kullanıcı bilgilerini getir
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  login,
  register,
  getProfile
}; 