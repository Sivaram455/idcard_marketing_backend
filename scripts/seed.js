/**
 * Seed script: Creates initial GMMC_ADMIN user
 * Run: node scripts/seed.js
 */
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const seedUsers = [
    {
        full_name: 'GMMC Admin',
        email: 'admin@gmmc.com',
        password: 'Admin@123',
        role: 'GMMC_ADMIN',
    },
    {
        full_name: 'Print Partner',
        email: 'printer@idcard.com',
        password: 'Printer@123',
        role: 'PRINTER',
    },
];

async function seed() {
    console.log('🌱 Starting database seeding...\n');

    for (const u of seedUsers) {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
        if (existing.length > 0) {
            console.log(`⏭️  User already exists: ${u.email}`);
            continue;
        }
        const hash = await bcrypt.hash(u.password, 10);
        await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
            [u.full_name, u.email, hash, u.role]
        );
        console.log(`✅ Created user: ${u.email} / ${u.password} (${u.role})`);
    }

    console.log('\n✨ Seeding complete!');
    console.log('\n📋 Login credentials:');
    seedUsers.forEach(u => {
        console.log(`   ${u.role}: ${u.email} / ${u.password}`);
    });
    console.log('\n   For SCHOOL_ADMIN: Create a tenant first, then add user with SCHOOL_ADMIN role via DB.\n');

    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
