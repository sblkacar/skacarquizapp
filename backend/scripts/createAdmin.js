const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    const adminData = {
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      status: 'approved'
    };

    // Önce mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin hesabı zaten mevcut');
      process.exit(0);
    }

    // Yeni admin oluştur
    const admin = await User.create(adminData);
    console.log('Admin hesabı oluşturuldu:', {
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

createAdmin(); 