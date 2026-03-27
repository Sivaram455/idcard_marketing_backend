const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/idmarket/idcard_marketing_backend/.env' });

async function checkRoles() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.query('SELECT DISTINCT role FROM users;');
        console.log('Available User Roles:', rows.map(r => r.role));
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await connection.end();
    }
}

checkRoles();
