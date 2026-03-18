/**
 * Create Ticketing Tables
 * Run: node scripts/create-ticketing-tables.js
 */
const { pool } = require('../config/db');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function createTables() {
    console.log('🏗️  Creating Ticketing Tables...\n');

    try {
        // Create tickets table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
                priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
                created_by INT NOT NULL,
                assigned_to INT,
                tenant_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (tenant_id) REFERENCES tenants(id)
            )
        `);
        console.log('✅ Tickets table created.');

        // Create ticket_attachments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ticket_attachments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_id INT NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(100),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Ticket Attachments table created.');

        console.log('\n✨ All Ticketing tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create tables:', error.message);
        process.exit(1);
    }
}

createTables();
