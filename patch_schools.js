const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/idmarket/idcard_marketing_backend/.env' });

async function patch() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const alterations = [
        { col: 'interested_in', sql: 'ALTER TABLE schools ADD COLUMN interested_in VARCHAR(255) DEFAULT NULL;' },
        { col: 'assigned_to',   sql: 'ALTER TABLE schools ADD COLUMN assigned_to INT DEFAULT NULL;' },
        { col: 'assigned_date', sql: 'ALTER TABLE schools ADD COLUMN assigned_date DATE DEFAULT NULL;' },
    ];

    for (const { col, sql } of alterations) {
        try {
            await connection.query(sql);
            console.log(`✅ Column "${col}" added successfully.`);
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME') {
                console.log(`ℹ️  Column "${col}" already exists — skipped.`);
            } else {
                console.error(`❌ Error adding "${col}":`, err.message);
            }
        }
    }

    await connection.end();
    console.log('\nSchema sync complete.');
}

patch();
