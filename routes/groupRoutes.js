const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/authMiddleware');

// Base Route: /api/groups

// Create & List Groups
router.post('/', auth, groupController.createGroup);
router.get('/', auth, groupController.getAllGroups);

// Details & Actions
router.get('/:id', auth, groupController.getGroupById);       // Get Details
router.post('/:id/join', auth, groupController.joinGroup);    // Join
router.post('/:id/leave', auth, groupController.leaveGroup);  // Leave
router.delete('/:id', auth, groupController.deleteGroup);     // Delete

module.exports = router;