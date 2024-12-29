const express = require('express');
const router = express.Router();
const { getPublicStats, getDetailedStats } = require('../controllers/statsController');

// Public istatistikler
router.get('/public', getPublicStats);

// Detaylı istatistikler (opsiyonel)
router.get('/detailed', getDetailedStats);

module.exports = router; 