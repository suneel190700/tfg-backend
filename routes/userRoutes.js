const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import the controller
const auth = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateUserProfile); // <--- THIS WAS MISSING

module.exports = router;