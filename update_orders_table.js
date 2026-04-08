const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/idmarket/idcard_marketing_backend/.env' });

async function updateOrdersTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Adding rzp_order_id and rzp_payment_id to marketing_orders...');
        
        // Use a safe approach to add columns if they don't exist
        const [columns] = await connection.query('SHOW COLUMNS FROM marketing_orders');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('rzp_order_id')) {
            await connection.query('ALTER TABLE marketing_orders ADD COLUMN rzp_order_id VARCHAR(255) DEFAULT NULL');
            console.log('✅ Added rzp_order_id');
        } else {
            console.log('ℹ️ rzp_order_id already exists');
        }

        if (!columnNames.includes('rzp_payment_id')) {
            await connection.query('ALTER TABLE marketing_orders ADD COLUMN rzp_payment_id VARCHAR(255) DEFAULT NULL');
            console.log('✅ Added rzp_payment_id');
        } else {
            console.log('ℹ️ rzp_payment_id already exists');
        }

        console.log('✅ Tables updated successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

updateOrdersTable();
