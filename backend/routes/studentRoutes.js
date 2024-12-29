const express = require('express');
const router = express.Router();
const { getStudentStats, getStudentResults } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/stats', protect, checkRole('student'), getStudentStats);
router.get('/results', protect, checkRole('student'), getStudentResults);

module.exports = router; 