const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (email, password) => {
    const [rows] = await pool.query(
        `SELECT u.*, t.tenant_name, t.tenant_code 
     FROM users u 
     LEFT JOIN tenants t ON u.tenant_id = t.id 
     WHERE u.email = ? AND u.status = 'ACTIVE'`,
        [email]
    );

    if (rows.length === 0) {
        throw new Error('Invalid email or password.');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        full_name: user.full_name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return {
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id,
            tenant_name: user.tenant_name,
            tenant_code: user.tenant_code,
        },
    };
};

const createAdminUser = async (email, password, full_name) => {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error('User already exists');

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, 'GMMC_ADMIN', 'ACTIVE')`,
        [full_name, email, hash]
    );
    return result.insertId;
};

module.exports = { login, createAdminUser };
