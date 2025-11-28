const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/chat/:groupId
// @desc    Send a message
router.post('/:groupId', auth, chatController.sendMessage);

// @route   GET /api/chat/:groupId
// @desc    Get messages
router.get('/:groupId', auth, chatController.getMessages);

module.exports = router;