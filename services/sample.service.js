const { pool } = require('../config/db');

const getByRequest = async (request_id) => {
    const [rows] = await pool.query(
        `SELECT s.*, u.full_name AS uploaded_by_name 
     FROM id_card_samples s
     LEFT JOIN users u ON s.uploaded_by = u.id
     WHERE s.request_id = ? ORDER BY s.uploaded_at DESC`,
        [request_id]
    );
    return rows;
};

const create = async (data, uploaded_by) => {
    const { request_id, sample_front_url, sample_back_url } = data;

    const [result] = await pool.query(
        `INSERT INTO id_card_samples (request_id, sample_front_url, sample_back_url, uploaded_by)
     VALUES (?, ?, ?, ?)`,
        [request_id, sample_front_url, sample_back_url, uploaded_by]
    );

    // Update request status to SAMPLE_UPLOADED
    await pool.query(
        `UPDATE id_card_requests SET current_status = 'SAMPLE_UPLOADED' WHERE id = ?`,
        [request_id]
    );

    return result.insertId;
};

const getById = async (id) => {
    const [rows] = await pool.query(`SELECT * FROM id_card_samples WHERE id = ?`, [id]);
    return rows[0] || null;
};

module.exports = { getByRequest, create, getById };
