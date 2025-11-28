const db = require('../config/db');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
    }

    try {
        // 1. Insert the group into 'project_groups'
        const newGroup = await db.query(
            `INSERT INTO project_groups (title, description, created_by) 
             VALUES ($1, $2, $3) RETURNING *`,
            [title, description, req.user.id]
        );

        const group = newGroup.rows[0];

        // 2. Automatically add the creator as a member in 'group_members'
        await db.query(
            `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`,
            [group.group_id, req.user.id]
        );

        res.status(201).json({ message: "Group created", group });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
exports.getAllGroups = async (req, res) => {
    try {
        // Fetch all groups and join with users to get creator name
        // Also counts members for each group
        const result = await db.query(
            `SELECT g.*, u.full_name as creator_name, 
            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) as member_count
             FROM project_groups g
             JOIN users u ON g.created_by = u.user_id
             ORDER BY g.created_at DESC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get single group details with members
// @route   GET /api/groups/:id
// @access  Private
exports.getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Get Group Info
        const groupResult = await db.query(
            `SELECT g.*, u.full_name as creator_name, u.user_id as creator_id
             FROM project_groups g
             JOIN users u ON g.created_by = u.user_id
             WHERE g.group_id = $1`, 
            [id]
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        // 2. Get Members
        const membersResult = await db.query(
            `SELECT u.user_id, u.full_name, u.email 
             FROM group_members gm
             JOIN users u ON gm.user_id = u.user_id
             WHERE gm.group_id = $1`,
            [id]
        );

        const group = groupResult.rows[0];
        group.members = membersResult.rows; // Attach members array

        res.json(group);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Join a group
// @route   POST /api/groups/:id/join
// @access  Private
exports.joinGroup = async (req, res) => {
    try {
        const { id } = req.params; // Group ID
        const userId = req.user.id;

        // Check if already a member
        const check = await db.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: "Already a member" });
        }

        await db.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [id, userId]);
        res.json({ message: "Joined group successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
exports.leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: "Left group successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete a group (Creator only)
// @route   DELETE /api/groups/:id
// @access  Private
exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check ownership
        const group = await db.query('SELECT * FROM project_groups WHERE group_id = $1', [id]);
        if (group.rows.length === 0) return res.status(404).json({ message: "Group not found" });

        if (group.rows[0].created_by !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this group" });
        }

        // Cascade delete handles members, so just delete the group
        await db.query('DELETE FROM project_groups WHERE group_id = $1', [id]);
        res.json({ message: "Group deleted" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.deleteGroupForce = async (req, res) => {
    try {
        const { id } = req.params;
        
        // No ownership check needed here because the route is protected by checkRole(['admin'])
        const result = await db.query('DELETE FROM project_groups WHERE group_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.json({ message: "Group successfully deleted by Admin" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};