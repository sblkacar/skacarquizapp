const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Debug için

      // Kullanıcıyı bul ve req.user'a ata
      const user = await User.findById(decoded.id).select('-password');
      console.log('Found user:', user); // Debug için

      if (!user) {
        return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Geçersiz token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Öğretmen rolü kontrolü
const teacherOnly = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ message: 'Bu işlem için öğretmen yetkisi gerekiyor' });
  }
};

// Öğrenci rolü kontrolü
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Bu işlem için öğrenci yetkisi gerekiyor' });
  }
};

module.exports = {
  protect,
  teacherOnly,
  studentOnly
}; 