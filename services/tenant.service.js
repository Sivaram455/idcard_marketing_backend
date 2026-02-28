const { pool } = require('../config/db');

const getAll = async () => {
    const [rows] = await pool.query(
        `SELECT * FROM tenants ORDER BY created_at DESC`
    );
    return rows;
};

const getById = async (id) => {
    const [rows] = await pool.query(`SELECT * FROM tenants WHERE id = ?`, [id]);
    return rows[0] || null;
};

const create = async (data) => {
    const { tenant_code, tenant_name, address, city, state, pincode, contact_email, contact_phone } = data;
    const [result] = await pool.query(
        `INSERT INTO tenants (tenant_code, tenant_name, address, city, state, pincode, contact_email, contact_phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [tenant_code, tenant_name, address, city, state, pincode, contact_email, contact_phone]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const { tenant_name, address, city, state, pincode, contact_email, contact_phone, status } = data;
    const [result] = await pool.query(
        `UPDATE tenants SET tenant_name=?, address=?, city=?, state=?, pincode=?, contact_email=?, contact_phone=?, status=?
     WHERE id = ?`,
        [tenant_name, address, city, state, pincode, contact_email, contact_phone, status, id]
    );
    return result.affectedRows;
};

module.exports = { getAll, getById, create, update };
