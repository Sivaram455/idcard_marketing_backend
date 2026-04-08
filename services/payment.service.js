const { pool } = require('../config/db');

// --- Payments ---

const createPaymentRecord = async (data) => {
    const { order_id, rzp_order_id, amount, currency, status, method } = data;
    const [result] = await pool.query(
        `INSERT INTO marketing_payments (order_id, rzp_order_id, amount, currency, status, method)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [order_id, rzp_order_id || null, amount, currency || 'INR', status || 'created', method || null]
    );
    return result.insertId;
};

const updatePaymentRecord = async (rzp_order_id, data) => {
    const { rzp_payment_id, rzp_signature, status, method } = data;
    const [result] = await pool.query(
        `UPDATE marketing_payments 
         SET rzp_payment_id = ?, rzp_signature = ?, status = ?, method = ?
         WHERE rzp_order_id = ?`,
        [rzp_payment_id, rzp_signature, status, method, rzp_order_id]
    );
    return result.affectedRows;
};

const getPaymentByRzpOrderId = async (rzp_order_id) => {
    const [rows] = await pool.query(
        `SELECT * FROM marketing_payments WHERE rzp_order_id = ?`,
        [rzp_order_id]
    );
    return rows[0];
};

// Get all payments for a specific order (transaction history)
const getPaymentsByOrder = async (order_id) => {
    const [rows] = await pool.query(
        `SELECT p.*, o.school_id, s.school_name
         FROM marketing_payments p
         LEFT JOIN marketing_orders o ON p.order_id = o.id
         LEFT JOIN schools s ON o.school_id = s.id
         WHERE p.order_id = ? AND p.status = 'captured'
         ORDER BY p.created_at DESC`,
        [order_id]
    );
    return rows;
};

// Get all payments across all orders (global transaction history)
const getAllPayments = async () => {
    const [rows] = await pool.query(
        `SELECT p.*, o.total_amount AS order_total, o.contact_person,
                s.school_name, s.mobile, s.email
         FROM marketing_payments p
         LEFT JOIN marketing_orders o ON p.order_id = o.id
         LEFT JOIN schools s ON o.school_id = s.id
         WHERE p.status = 'captured'
         ORDER BY p.created_at DESC`
    );
    return rows;
};

// Record a cash payment directly (no Razorpay)
const recordCashPayment = async (order_id, amount) => {
    const receipt = `CASH-${order_id}-${Date.now()}`;
    const [result] = await pool.query(
        `INSERT INTO marketing_payments (order_id, rzp_order_id, amount, currency, status, method)
         VALUES (?, ?, ?, 'INR', 'captured', 'cash')`,
        [order_id, receipt, amount]
    );
    return result.insertId;
};

// Payment stats for analytics
const getPaymentStats = async () => {
    const [rows] = await pool.query(`
        SELECT
            COUNT(*) AS total_transactions,
            SUM(amount) AS total_collected,
            SUM(CASE WHEN method = 'cash' THEN amount ELSE 0 END) AS cash_collected,
            SUM(CASE WHEN method != 'cash' THEN amount ELSE 0 END) AS online_collected,
            COUNT(CASE WHEN method = 'cash' THEN 1 END) AS cash_count,
            COUNT(CASE WHEN method != 'cash' THEN 1 END) AS online_count
        FROM marketing_payments
        WHERE status = 'captured'
    `);
    return rows[0];
};

module.exports = {
    createPaymentRecord,
    updatePaymentRecord,
    getPaymentByRzpOrderId,
    getPaymentsByOrder,
    getAllPayments,
    recordCashPayment,
    getPaymentStats
};

