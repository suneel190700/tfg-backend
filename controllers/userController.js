const db = require('../config/db');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await db.query(
            'SELECT user_id, full_name, email, skills, interests, availability_hours FROM users WHERE user_id = $1',
            [userId]
        );
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    const { skills, interests, availabilityHours } = req.body;
    const userId = req.user.id;

    try {
        // Update query
        const updatedUser = await db.query(
            `UPDATE users 
             SET skills = $1, interests = $2, availability_hours = $3
             WHERE user_id = $4
             RETURNING user_id, full_name, email, skills, interests, availability_hours`,
            [skills, interests, availabilityHours, userId]
        );

        res.json(updatedUser.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};