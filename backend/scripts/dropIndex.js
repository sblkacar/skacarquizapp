const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı başarılı');

    // users koleksiyonundaki username index'ini kaldır
    await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('Username index başarıyla kaldırıldı');

  } catch (error) {
    if (error.code === 27) {
      console.log('Index zaten silinmiş');
    } else {
      console.error('Hata:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

dropIndex(); 