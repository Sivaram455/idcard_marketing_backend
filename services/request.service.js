const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateRequestNo = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${yy}${mm}${dd}-${rand}`;
};

const getAll = async (filters = {}) => {
    let query = `
    SELECT r.*, t.tenant_name, t.tenant_code, u.full_name AS created_by_name,
           (SELECT COUNT(*) FROM students s WHERE s.request_id = r.id) AS total_students
    FROM id_card_requests r
    LEFT JOIN tenants t ON r.tenant_id = t.id
    LEFT JOIN users u ON r.created_by = u.id
    WHERE 1=1
  `;
    const params = [];

    if (filters.tenant_id) {
        query += ' AND r.tenant_id = ?';
        params.push(filters.tenant_id);
    }
    if (filters.status) {
        query += ' AND r.current_status = ?';
        params.push(filters.status);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
};

const getById = async (id) => {
    const [rows] = await pool.query(
        `SELECT r.*, t.tenant_name, t.tenant_code, u.full_name AS created_by_name
     FROM id_card_requests r
     LEFT JOIN tenants t ON r.tenant_id = t.id
     LEFT JOIN users u ON r.created_by = u.id
     WHERE r.id = ?`,
        [id]
    );
    return rows[0] || null;
};

const getWithDetails = async (id) => {
    const request = await getById(id);
    if (!request) return null;

    const [students] = await pool.query(
        `SELECT * FROM students WHERE request_id = ?`,
        [id]
    );
    const [samples] = await pool.query(
        `SELECT s.*, u.full_name AS uploaded_by_name FROM id_card_samples s
     LEFT JOIN users u ON s.uploaded_by = u.id
     WHERE s.request_id = ?`,
        [id]
    );
    const [approvals] = await pool.query(
        `SELECT a.*, u.full_name AS action_by_name FROM id_card_approvals a
     LEFT JOIN users u ON a.action_by = u.id
     WHERE a.request_id = ? ORDER BY a.created_at ASC`,
        [id]
    );

    return { ...request, students, samples, approvals };
};

const create = async (data, created_by) => {
    const {
        tenant_id,
        excel_file_url,
        photos_zip_url,
        old_lanyard_url,
        old_id_card_url,
        principal_signature_url,
        school_logo_url,
        remarks
    } = data;

    const request_no = generateRequestNo();

    // Use empty string '' as fallback — avoids NOT NULL constraint without a DB migration
    const safe = (v) => (v && String(v).trim()) ? String(v).trim() : '';

    const [result] = await pool.query(
        `INSERT INTO id_card_requests
         (tenant_id, request_no, excel_file_url, photos_zip_url, old_lanyard_url, old_id_card_url,
          principal_signature_url, school_logo_url, current_status, remarks, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?)`,
        [
            tenant_id,
            request_no,
            safe(excel_file_url),
            safe(photos_zip_url),
            safe(old_lanyard_url),
            safe(old_id_card_url),
            safe(principal_signature_url),
            safe(school_logo_url),
            remarks || null,
            created_by
        ]
    );

    return { id: result.insertId, request_no };
};



const updateStatus = async (id, status, remarks) => {
    const [result] = await pool.query(
        `UPDATE id_card_requests SET current_status = ?, remarks = ? WHERE id = ?`,
        [status, remarks || null, id]
    );
    return result.affectedRows;
};

const getStatusCounts = async (tenant_id = null) => {
    let query = `
    SELECT current_status, COUNT(*) as count 
    FROM id_card_requests
    WHERE 1=1
  `;
    const params = [];
    if (tenant_id) {
        query += ' AND tenant_id = ?';
        params.push(tenant_id);
    }
    query += ' GROUP BY current_status';

    const [rows] = await pool.query(query, params);
    return rows;
};

module.exports = { getAll, getById, getWithDetails, create, updateStatus, getStatusCounts };
