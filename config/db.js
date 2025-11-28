const { Pool } = require('pg');
require('dotenv').config();

// 1. Define the base configuration
// This reads the connection string from your .env file
const poolConfig = {
    connectionString: process.env.DATABASE_URL,
};

// 2. Add SSL setting ONLY if connecting to Neon (checked via DB_SSL env var or DATABASE_URL presence)
// Neon requires SSL connections. 'rejectUnauthorized: false' allows connection without local certs.
// We check if DATABASE_URL exists and contains 'neon.tech' to auto-enable SSL for Neon.
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')) {
    poolConfig.ssl = {
        rejectUnauthorized: false 
    };
}

// 3. Create the pool using the config
const pool = new Pool(poolConfig);

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