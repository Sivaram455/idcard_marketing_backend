/**
 * Ticketing Module Database Setup
 * Run: node scripts/setup-ticketing.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/db');

async function setup() {
    try {
        console.log('🚀 Setting up ticketing module database...\n');

        // 1. Update roles in users table (if role is an ENUM)
        // Let's check the current role column type first
        const [userCols] = await pool.query("DESCRIBE users");
        const roleCol = userCols.find(c => c.Field === 'role');
        const userIdCol = userCols.find(c => c.Field === 'id');
        
        const [tenantCols] = await pool.query("DESCRIBE tenants");
        const tenantIdCol = tenantCols.find(c => c.Field === 'id');

        console.log(`Current role column type: ${roleCol.Type}`);
        console.log(`Current users.id column type: ${userIdCol.Type}`);
        console.log(`Current tenants.id column type: ${tenantIdCol.Type}`);
        
        if (roleCol.Type.includes('enum')) {
            // Add SUPPORT and DEVELOPER to the enum
            // We need to extract existing values and add new ones
            let currentEnum = roleCol.Type.match(/'([^']+)'/g).map(v => v.replace(/'/g, ''));
            const newRoles = ['SUPPORT', 'DEVELOPER'];
            let updatedEnum = [...new Set([...currentEnum, ...newRoles])];
            const enumString = updatedEnum.map(v => `'${v}'`).join(',');
            
            console.log(`Updating role enum to: ${enumString}`);
            await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM(${enumString}) NOT NULL`);
            console.log('✅ User roles updated.');
        } else {
            console.log('ℹ️ Role column is not an enum or already supports arbitrary strings.');
        }

        // 2. Create tickets table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
                priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
                created_by BIGINT NOT NULL,
                assigned_to BIGINT,
                tenant_id BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id)
            )
        `);
        console.log('✅ Tickets table created.');
 
        // 3. Create ticket_attachments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ticket_attachments (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                ticket_id BIGINT NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(100),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Ticket Attachments table created.');

        // 4. Create ticket_comments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ticket_comments (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                ticket_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Ticket Comments table created.');

        // 5. Create sample users for testing
        const bcrypt = require('bcryptjs');
        const supportHash = await bcrypt.hash('support123', 10);
        const devHash = await bcrypt.hash('dev123', 10);

        await pool.query(`
            INSERT IGNORE INTO users (full_name, email, password_hash, role, status)
            VALUES 
            ('Support Lead', 'support@idpro.com', ?, 'SUPPORT', 'ACTIVE'),
            ('Senior Developer', 'dev@idpro.com', ?, 'DEVELOPER', 'ACTIVE')
        `, [supportHash, devHash]);
        console.log('✅ Tech team aliases created (support@idpro.com, dev@idpro.com).');

        // 6. Create initial tickets if none exist
        const [existing] = await pool.query("SELECT COUNT(*) as count FROM tickets");
        if (existing[0].count === 0) {
            console.log('🔧 Seeding initial system health reports...');
            // We need a creator ID (admin) and a tenant ID
            const [admins]  = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'GMMC_ADMIN') LIMIT 1");
            const [tenants] = await pool.query("SELECT id FROM tenants LIMIT 1");

            if (admins.length && tenants.length) {
                await pool.query(`
                    INSERT INTO tickets (title, description, status, priority, created_by, tenant_id)
                    VALUES 
                    ('Database Performance Spike', 'Monitoring node detects high CPU usage in the production cluster during bulk exports.', 'IN_PROGRESS', 'HIGH', ?, ?),
                    ('New School Onboarding UI Bug', 'Tenant registration fails when special characters are used in the school name.', 'OPEN', 'MEDIUM', ?, ?)
                `, [admins[0].id, tenants[0].id, admins[0].id, tenants[0].id]);
                console.log('✅ Initial tickets seeded.');
            }
        }

        console.log('\n✨ Ticketing Architecture Established!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Setup failed:', err.message);
        process.exit(1);
    }
}

setup();
