/**
 * Run once: makes excel_file_url, photos_zip_url nullable in id_card_requests
 * Usage: node scripts/fix-nullable-columns.js
 */
require('dotenv').config();
const { pool } = require('../config/db');

async function run() {
    try {
        console.log('🔧 Fixing column constraints...');

        const fixes = [
            `ALTER TABLE id_card_requests MODIFY COLUMN excel_file_url VARCHAR(1000) DEFAULT NULL`,
            `ALTER TABLE id_card_requests MODIFY COLUMN photos_zip_url VARCHAR(1000) DEFAULT NULL`,
            `ALTER TABLE id_card_requests MODIFY COLUMN old_lanyard_url VARCHAR(1000) DEFAULT NULL`,
            `ALTER TABLE id_card_requests MODIFY COLUMN old_id_card_url VARCHAR(1000) DEFAULT NULL`,
            `ALTER TABLE id_card_requests MODIFY COLUMN principal_signature_url VARCHAR(1000) DEFAULT NULL`,
            `ALTER TABLE id_card_requests MODIFY COLUMN school_logo_url VARCHAR(1000) DEFAULT NULL`,
        ];

        for (const sql of fixes) {
            await pool.query(sql);
            console.log('  ✅', sql.split('COLUMN')[1].trim().split(' ')[0]);
        }

        console.log('\n✅ All columns are now nullable. Restart the server.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

run();
