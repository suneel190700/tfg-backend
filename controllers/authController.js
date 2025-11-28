const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User Logic
exports.registerUser = async (req, res) => {
    const { email, password, full_name, role } = req.body;

    // 1. Validation
    if (!email || !password || !full_name) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        // 2. Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Insert into Database
        const newUser = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, $4) RETURNING user_id, email, role`,
            [email, passwordHash, full_name, role || 'student']
        );

        // 5. Create Token
        const token = jwt.sign(
            { id: newUser.rows[0].user_id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "User registered successfully",
            token: token,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login User Logic
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
        // 2. Check for user in Database
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const user = userResult.rows[0];

        // 3. Verify Password (Compare plain text with hash)
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 4. Create JWT Token
        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // 5. Send Success Response
        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};