const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
require('dotenv').config();

const cleanDatabase = async () => {
  try {
    // MongoDB'ye bağlan
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Tüm koleksiyonları temizle
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Result.deleteMany({});
    console.log('Tüm koleksiyonlar temizlendi');

    // Basit şifre hash'leme
    const plainPassword = 'test123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Test için hash'i kontrol et
    const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Test password match:', testMatch);

    // Test kullanıcılarını oluştur
    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Öğretmen 1',
        email: 'teacher1@test.com',
        password: hashedPassword,
        role: 'teacher'
      },
      {
        name: 'Öğretmen 2',
        email: 'teacher2@test.com',
        password: hashedPassword,
        role: 'teacher'
      },
      {
        name: 'Öğrenci 1',
        email: 'student1@test.com',
        password: hashedPassword,
        role: 'student'
      },
      {
        name: 'Öğrenci 2',
        email: 'student2@test.com',
        password: hashedPassword,
        role: 'student'
      },
      {
        name: 'Öğrenci 3',
        email: 'student3@test.com',
        password: hashedPassword,
        role: 'student'
      }
    ];

    // Kullanıcıları kaydet
    for (const userData of users) {
      await User.create(userData);
      console.log(`${userData.role.toUpperCase()} kullanıcısı oluşturuldu:`, userData.email);
    }

    // Test için admin kullanıcısını kontrol et
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    if (adminUser) {
      const passwordCheck = await bcrypt.compare(plainPassword, adminUser.password);
      console.log('\nAdmin kullanıcı kontrolü:', {
        found: true,
        passwordMatch: passwordCheck
      });
    }

    console.log('\nTüm kullanıcılar için şifre:', plainPassword);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

cleanDatabase(); 