const { Pool } = require('pg');
require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL; // Uses the full string from Neon

const pool = new Pool({
    connectionString: connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false // Neon requires SSL
});

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to PostgreSQL database');
    release();
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};