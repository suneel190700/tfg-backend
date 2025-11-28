const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/authMiddleware');

// @route   GET /api/matches
// @desc    Get teammate recommendations
router.get('/', auth, matchController.getRecommendations);

module.exports = router;