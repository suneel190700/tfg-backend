require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware (Order is critical: JSON parser must be before routes)
app.use(cors());
app.use(express.json()); 

// 2. Routes Definition
app.use('/api/auth', require('./routes/authRoutes')); // Public Routes (Login/Register)
app.use('/api/users', require('./routes/userRoutes')); // Protected Routes (Profile)
app.use('/api/groups', require('./routes/groupRoutes')); // <--- ADD THIS LINE
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/matches', require('./routes/matchRoutes')); // <--- ADD THIS LINE

// 3. Root Test Route
app.get('/', (req, res) => {
    res.send('TFG Enterprise API is running...');
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});