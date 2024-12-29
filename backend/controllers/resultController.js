const Result = require('../models/Result');

// @desc    Sonucu ID'ye göre getir
// @route   GET /api/results/:id
// @access  Private
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('quiz')
      .populate('student', 'name');

    if (!result) {
      return res.status(404).json({ message: 'Sonuç bulunamadı' });
    }

    // Sonucu sadece ilgili öğrenci veya öğretmen görebilir
    if (req.user.role === 'student' && result.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu sonucu görme yetkiniz yok' });
    }

    res.json(result);
  } catch (error) {
    console.error('Sonuç getirme hatası:', error);
    res.status(500).json({ message: 'Sonuç getirilemedi' });
  }
};

module.exports = {
  getResultById
}; 