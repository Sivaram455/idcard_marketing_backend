const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/idmarket/idcard_marketing_backend/.env' });

async function createPaymentsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Creating marketing_payments table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS marketing_payments (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                order_id        INT NOT NULL,
                rzp_order_id    VARCHAR(255) NOT NULL,
                rzp_payment_id  VARCHAR(255) DEFAULT NULL,
                rzp_signature   VARCHAR(255) DEFAULT NULL,
                amount          DECIMAL(10,2) NOT NULL,
                currency        VARCHAR(10) DEFAULT 'INR',
                status          VARCHAR(50) DEFAULT 'created', -- created, captured, failed
                method          VARCHAR(50) DEFAULT NULL,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES marketing_orders(id) ON DELETE CASCADE
            );
        `);
        console.log('✅ marketing_payments table created successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

createPaymentsTable();
