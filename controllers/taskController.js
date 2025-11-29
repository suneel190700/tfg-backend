const db = require('../config/db');

// @desc    Create a task
// @route   POST /api/tasks/:groupId
exports.createTask = async (req, res) => {
    const { groupId } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title) return res.status(400).json({ message: "Task title is required" });

    try {
        // Verify Membership
        const memberCheck = await db.query(
            'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );
        if (memberCheck.rows.length === 0) return res.status(403).json({ message: "Not a member" });

        const newTask = await db.query(
            `INSERT INTO group_tasks (group_id, created_by, title, description) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [groupId, userId, title, description]
        );

        res.status(201).json(newTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get tasks for a group
// @route   GET /api/tasks/:groupId
exports.getTasks = async (req, res) => {
    const { groupId } = req.params;
    try {
        const tasks = await db.query(
            `SELECT t.*, u.full_name as creator_name 
             FROM group_tasks t
             LEFT JOIN users u ON t.created_by = u.user_id
             WHERE t.group_id = $1 ORDER BY t.created_at DESC`,
            [groupId]
        );
        res.json(tasks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:taskId
exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body; // 'todo', 'in_progress', 'done'

    try {
        const updatedTask = await db.query(
            'UPDATE group_tasks SET status = $1 WHERE task_id = $2 RETURNING *',
            [status, taskId]
        );
        if (updatedTask.rows.length === 0) return res.status(404).json({ message: "Task not found" });
        res.json(updatedTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:taskId
exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        await db.query('DELETE FROM group_tasks WHERE task_id = $1', [taskId]);
        res.json({ message: "Task deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};