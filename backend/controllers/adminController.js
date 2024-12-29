const User = require('../models/User');

// @desc    Bekleyen öğretmen başvurularını getir
// @route   GET /api/admin/pending-teachers
// @access  Private/Admin
const getPendingTeachers = async (req, res) => {
  try {
    console.log('Admin isteği:', {
      userId: req.user._id,
      userRole: req.user.role
    });

    const pendingTeachers = await User.find({
      role: 'teacher',
      status: 'pending'
    }).select('-password');

    console.log('Bulunan bekleyen öğretmenler:', pendingTeachers);

    res.json(pendingTeachers);
  } catch (error) {
    console.error('Admin controller hatası:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası',
      error: error.message 
    });
  }
};

// @desc    Öğretmen başvurusunu onayla/reddet
// @route   PUT /api/admin/teacher-approval/:id
// @access  Private/Admin
const updateTeacherStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const teacherId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum' });
    }

    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: 'Öğretmen bulunamadı' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Kullanıcı öğretmen değil' });
    }

    teacher.status = status;
    if (status === 'approved') {
      teacher.approvedAt = Date.now();
      teacher.approvedBy = req.user._id;
    }

    await teacher.save();

    res.json({
      message: `Öğretmen başvurusu ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
      teacher
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// @desc    Kullanıcı istatistiklerini getir
// @route   GET /api/admin/user-stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    // Detaylı loglar ekleyelim
    console.log('İstatistik hesaplanıyor...');

    // Öğrenci sayısı
    const totalStudents = await User.countDocuments({ 
      role: 'student'
    });
    console.log('Toplam öğrenci:', totalStudents);

    // Tüm öğretmenler (durumdan bağımsız)
    const totalTeachers = await User.countDocuments({ 
      role: 'teacher'
    });
    console.log('Toplam öğretmen:', totalTeachers);

    // Bekleyen öğretmenler
    const pendingTeachers = await User.countDocuments({ 
      role: 'teacher',
      status: 'pending'
    });
    console.log('Bekleyen öğretmen:', pendingTeachers);

    // Onaylı öğretmenler
    const approvedTeachers = await User.countDocuments({ 
      role: 'teacher',
      status: 'approved'
    });
    console.log('Onaylı öğretmen:', approvedTeachers);

    // Tüm kullanıcıları getirip detaylı log
    const allUsers = await User.find({}, 'name email role status');
    console.log('Tüm kullanıcılar:', JSON.stringify(allUsers, null, 2));

    const stats = {
      totalStudents,
      totalTeachers,
      pendingTeachers,
      approvedTeachers
    };

    console.log('Hesaplanan istatistikler:', stats);

    res.json(stats);
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ 
      message: 'İstatistikler getirilemedi',
      error: error.message 
    });
  }
};

module.exports = {
  getPendingTeachers,
  updateTeacherStatus,
  getUserStats
}; 