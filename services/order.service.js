const { pool } = require('../config/db');

// --- Orders ---

const createOrder = async (data) => {
    const {
        school_id, modules, total_amount, initial_payment, payment_mode,
        payment_status, expected_go_live, order_date, contract_signed,
        contact_person, cost_per_student, remarks, status, created_by
    } = data;
    const [result] = await pool.query(
        `INSERT INTO marketing_orders 
         (school_id, modules, total_amount, initial_payment, payment_mode, payment_status,
          expected_go_live, order_date, contract_signed, contact_person, cost_per_student, remarks, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [school_id, modules, total_amount || 0, initial_payment || 0, payment_mode || 'Cash',
         payment_status || 'Pending', expected_go_live, order_date || new Date(),
         contract_signed || 'No', contact_person, cost_per_student || '0', remarks, status || 'Draft', created_by]
    );
    return result.insertId;
};

const getAllOrders = async () => {
    const [rows] = await pool.query(`
        SELECT o.*, s.school_name, s.city, s.state, u.full_name AS created_by_name
        FROM marketing_orders o
        LEFT JOIN schools s ON o.school_id = s.id
        LEFT JOIN users u ON o.created_by = u.id
        ORDER BY o.created_at DESC
    `);
    return rows;
};

const getOrderById = async (id) => {
    const [rows] = await pool.query(`
        SELECT o.*, s.school_name, s.city, s.state, s.mobile, s.email, s.Board, s.studnetscount AS studentscount,
               u.full_name AS created_by_name
        FROM marketing_orders o
        LEFT JOIN schools s ON o.school_id = s.id
        LEFT JOIN users u ON o.created_by = u.id
        WHERE o.id = ?
    `, [id]);
    return rows[0];
};

const getOrdersBySchool = async (school_id) => {
    const [rows] = await pool.query(`
        SELECT o.*, u.full_name AS created_by_name
        FROM marketing_orders o
        LEFT JOIN users u ON o.created_by = u.id
        WHERE o.school_id = ?
        ORDER BY o.created_at DESC
    `, [school_id]);
    return rows;
};

const updateOrder = async (id, data) => {
    const {
        modules, total_amount, initial_payment, payment_mode, payment_status,
        expected_go_live, order_date, contract_signed, contact_person, cost_per_student, remarks, status
    } = data;
    const [result] = await pool.query(
        `UPDATE marketing_orders SET
         modules=?, total_amount=?, initial_payment=?, payment_mode=?, payment_status=?,
         expected_go_live=?, order_date=?, contract_signed=?, contact_person=?, cost_per_student=?, remarks=?, status=?
         WHERE id = ?`,
        [modules, total_amount, initial_payment, payment_mode, payment_status,
         expected_go_live, order_date, contract_signed, contact_person, cost_per_student, remarks, status, id]
    );
    return result.affectedRows;
};

const deleteOrder = async (id) => {
    const [result] = await pool.query('DELETE FROM marketing_orders WHERE id = ?', [id]);
    return result.affectedRows;
};

const getOrderStats = async () => {
    const [rows] = await pool.query(`
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed,
            SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) AS draft,
            SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
            SUM(total_amount) AS total_revenue,
            SUM(initial_payment) AS total_collected
        FROM marketing_orders
    `);
    return rows[0];
};

module.exports = { createOrder, getAllOrders, getOrderById, getOrdersBySchool, updateOrder, deleteOrder, getOrderStats };
