const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getAll = async () => {
    const [rows] = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.created_at,
                t.tenant_name, t.tenant_code
         FROM users u
         LEFT JOIN tenants t ON u.tenant_id = t.id
         ORDER BY u.created_at DESC`
    );
    return rows;
};

const getById = async (id) => {
    const [rows] = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.tenant_id, u.created_at,
                t.tenant_name
         FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id
         WHERE u.id = ?`,
        [id]
    );
    return rows[0] || null;
};

const create = async (data) => {
    const { full_name, email, phone, password, role, tenant_id } = data;
    // Check for duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) throw new Error('A user with this email already exists.');

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, tenant_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [full_name, email, phone || null, hash, role, tenant_id || null]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const { full_name, phone, role, status, tenant_id } = data;
    const [result] = await pool.query(
        `UPDATE users SET full_name=?, phone=?, role=?, status=?, tenant_id=? WHERE id=?`,
        [full_name, phone || null, role, status, tenant_id || null, id]
    );
    return result.affectedRows;
};

const resetPassword = async (id, newPassword) => {
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password_hash=? WHERE id=?`, [hash, id]);
};

const getStats = async () => {
    const [[tenantCount]] = await pool.query(`SELECT COUNT(*) as count FROM tenants WHERE status='ACTIVE'`);
    const [[userCount]] = await pool.query(`SELECT COUNT(*) as count FROM users WHERE status='ACTIVE'`);
    const [[reqCount]] = await pool.query(`SELECT COUNT(*) as count FROM id_card_requests`);
    const [roleBreakdown] = await pool.query(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );
    return {
        tenants: tenantCount.count,
        users: userCount.count,
        requests: reqCount.count,
        roleBreakdown,
    };
};

module.exports = { getAll, getById, create, update, resetPassword, getStats };
