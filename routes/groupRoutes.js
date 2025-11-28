const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware'); // Ensure this is imported

// Standard Routes
router.post('/', auth, groupController.createGroup);
router.get('/', auth, groupController.getAllGroups);
router.get('/:id', auth, groupController.getGroupById);
router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/leave', auth, groupController.leaveGroup);
router.delete('/:id', auth, groupController.deleteGroup); // Standard Owner Delete

// 🛡️ ADMIN ROUTE: Force Delete
// Only users with 'admin' role can hit this endpoint
router.delete('/admin/:id', auth, checkRole(['admin']), groupController.deleteGroupForce);

module.exports = router;