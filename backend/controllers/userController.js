const User = require('../models/User');
const Result = require('../models/Result');

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcılar getirilemedi' });
  }
};

// @desc    Öğrenci sonuçlarını getir
// @route   GET /api/users/results
// @access  Private/Student
const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title')
      .sort('-completedAt');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Sonuçlar getirilemedi' });
  }
};

// @desc    Kullanıcı güncelle
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.name = req.body.name || user.name;
      user.role = req.body.role || user.role;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı güncellenemedi' });
  }
};

// @desc    Kullanıcı sil
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.remove();
      res.json({ message: 'Kullanıcı silindi' });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı silinemedi' });
  }
};

module.exports = {
  getUsers,
  getMyResults,
  updateUser,
  deleteUser
}; 