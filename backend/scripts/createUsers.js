const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Örnek öğrenciler
    const students = [
      { 
        name: 'Test Öğrenci',
        email: 'student@test.com',
        password: '123456',
        role: 'student',
        status: 'approved'  // Öğrenci hesabı direkt onaylı olsun
      }
    ];

    // Örnek öğretmenler
    const teachers = [
      { 
        name: 'Test Öğretmen',
        email: 'teacher@test.com',
        password: '123456',
        role: 'teacher',
        status: 'approved'  // Test için öğretmen hesabı da onaylı olsun
      }
    ];

    // Önce mevcut kullanıcıları temizle
    await User.deleteMany({ 
      email: { 
        $in: [...students.map(s => s.email), ...teachers.map(t => t.email)]
      }
    });

    // Kullanıcıları oluştur
    for (const student of students) {
      await User.create(student);
      console.log(`Öğrenci oluşturuldu: ${student.email}`);
    }

    for (const teacher of teachers) {
      await User.create(teacher);
      console.log(`Öğretmen oluşturuldu: ${teacher.email}`);
    }

    // Mevcut kullanıcıları kontrol et
    const allUsers = await User.find({});
    console.log('\nMevcut kullanıcılar:');
    allUsers.forEach(user => {
      console.log(`${user.name} (${user.email}) - ${user.role} - ${user.status}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB bağlantısı kapatıldı');
  }
};

createUsers(); 