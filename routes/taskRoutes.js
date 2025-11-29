const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

router.post('/:groupId', auth, taskController.createTask);
router.get('/:groupId', auth, taskController.getTasks);
router.put('/:taskId', auth, taskController.updateTaskStatus);
router.delete('/:taskId', auth, taskController.deleteTask);

module.exports = router;