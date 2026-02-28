require('dotenv').config();
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

async function run() {
    const email = 'printer@idpro.com';
    const password = 'printer123';
    const hash = await bcrypt.hash(password, 10);

    // Create printer user (skip if already exists)
    await pool.query(`
        INSERT INTO users (full_name, email, password_hash, role, status)
        VALUES ('Printer User', ?, ?, 'PRINTER', 'ACTIVE')
        ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'PRINTER', status = 'ACTIVE'
    `, [email, hash]);

    // Also ensure a GMMC_ADMIN user exists
    const adminHash = await bcrypt.hash('admin123', 10);
    await pool.query(`
        INSERT INTO users (full_name, email, password_hash, role, status)
        VALUES ('GMMC Admin', 'admin@idpro.com', ?, 'GMMC_ADMIN', 'ACTIVE')
        ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'GMMC_ADMIN', status = 'ACTIVE'
    `, [adminHash]);

    const [rows] = await pool.query(
        `SELECT id, full_name, email, role, status FROM users WHERE email IN (?, ?) ORDER BY role`,
        [email, 'admin@idpro.com']
    );

    console.log('\n✅ Users ready:\n');
    console.log('┌─────────────────────────────────────────────────┐');
    rows.forEach(u => {
        const pwd = u.role === 'PRINTER' ? 'printer123' : 'admin123';
        console.log(`│  Role:     ${u.role.padEnd(35)}│`);
        console.log(`│  Email:    ${u.email.padEnd(35)}│`);
        console.log(`│  Password: ${pwd.padEnd(35)}│`);
        console.log('├─────────────────────────────────────────────────┤');
    });
    console.log('└─────────────────────────────────────────────────┘\n');
    process.exit(0);
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
