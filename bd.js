const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'alimento-camaron',
    password: 'Admin2026',
    port: 5432
});

module.exports = pool;