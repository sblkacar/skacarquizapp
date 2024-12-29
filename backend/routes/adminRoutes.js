const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const {
  getPendingTeachers,
  updateTeacherStatus,
  getUserStats
} = require('../controllers/adminController');

router.use(protect);
router.use(adminOnly);

router.get('/pending-teachers', getPendingTeachers);
router.put('/teacher-approval/:id', updateTeacherStatus);
router.get('/user-stats', protect, adminOnly, getUserStats);

module.exports = router; 