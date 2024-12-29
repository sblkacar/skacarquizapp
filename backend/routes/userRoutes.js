const express = require('express');
const router = express.Router();
const {
  getUsers,
  getMyResults,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/', protect, checkRole('admin'), getUsers);
router.get('/results', protect, checkRole('student'), getMyResults);
router.route('/:id')
  .put(protect, checkRole('admin'), updateUser)
  .delete(protect, checkRole('admin'), deleteUser);

module.exports = router; 