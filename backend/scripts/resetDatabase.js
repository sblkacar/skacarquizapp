const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Koleksiyonları temizle
    await User.collection.drop();
    console.log('User koleksiyonu temizlendi');

    // Admin hesabını yeniden oluştur
    const adminData = {
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      status: 'approved'
    };

    await User.create(adminData);
    console.log('Admin hesabı oluşturuldu');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

resetDatabase(); 