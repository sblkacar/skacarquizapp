const express = require('express');
const router = express.Router();
const { getResultById } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id', protect, getResultById);

module.exports = router; 