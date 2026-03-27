const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/idmarket/idcard_marketing_backend/.env' });

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    const [rows] = await connection.query('SELECT email, role FROM users;');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}
check();
