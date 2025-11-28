const db = require('../config/db');

// @desc    Send a message to a group
// @route   POST /api/chat/:groupId
// @access  Private (Member only)
exports.sendMessage = async (req, res) => {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ message: "Message content required" });

    try {
        // 1. Check if user is a member of the group
        const memberCheck = await db.query(
            'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: "You must be a member to send messages." });
        }

        // 2. Insert Message
        const newMessage = await db.query(
            `INSERT INTO group_messages (group_id, sender_id, content) 
             VALUES ($1, $2, $3) RETURNING *`,
            [groupId, userId, content]
        );

        res.status(201).json(newMessage.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all messages for a group
// @route   GET /api/chat/:groupId
// @access  Private (Member only)
exports.getMessages = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Check membership
        const memberCheck = await db.query(
            'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: "Access denied." });
        }

        // 2. Fetch Messages with Sender Names
        const messages = await db.query(
            `SELECT m.*, u.full_name, u.email 
             FROM group_messages m
             JOIN users u ON m.sender_id = u.user_id
             WHERE m.group_id = $1
             ORDER BY m.created_at ASC`, // Oldest first
            [groupId]
        );

        res.json(messages.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};