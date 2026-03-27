const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/idmarket/idcard_marketing_backend/.env' });

async function createOrdersTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS marketing_orders (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                school_id       INT NOT NULL,
                modules         TEXT,
                total_amount    DECIMAL(10,2) DEFAULT 0,
                initial_payment DECIMAL(10,2) DEFAULT 0,
                payment_mode    VARCHAR(50) DEFAULT 'Cash',
                payment_status  VARCHAR(50) DEFAULT 'Pending',
                expected_go_live DATE DEFAULT NULL,
                order_date      DATE DEFAULT (CURRENT_DATE),
                contract_signed VARCHAR(10) DEFAULT 'No',
                contact_person  VARCHAR(255),
                cost_per_student VARCHAR(50) DEFAULT '0',
                remarks         TEXT,
                status          VARCHAR(50) DEFAULT 'Draft',
                created_by      INT,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
            );
        `);
        console.log('✅ marketing_orders table created successfully.');
    } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('ℹ️  Table already exists — skipped.');
        } else {
            console.error('❌ Error:', err.message);
        }
    } finally {
        await connection.end();
    }
}

createOrdersTable();
