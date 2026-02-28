const { pool } = require('../config/db');

// Status transitions per role
const STATUS_MAP = {
    GMMC: {
        APPROVED: 'GMMC_APPROVED',
        REJECTED: 'GMMC_REJECTED',
    },
    PRINTER: {
        APPROVED: 'PRINTER_APPROVED',
        REJECTED: 'PRINTER_REJECTED',
    },
    SCHOOL: {
        APPROVED: 'SCHOOL_VERIFIED',
        REJECTED: 'GMMC_APPROVED', // School rejects -> goes back to GMMC_APPROVED for re-print
    },
    FINAL: {
        APPROVED: 'BULK_PRINT_APPROVED',
        REJECTED: 'GMMC_VERIFIED',
    },
};

const getByRequest = async (request_id) => {
    const [rows] = await pool.query(
        `SELECT a.*, u.full_name AS action_by_name
     FROM id_card_approvals a
     LEFT JOIN users u ON a.action_by = u.id
     WHERE a.request_id = ? ORDER BY a.created_at ASC`,
        [request_id]
    );
    return rows;
};

const create = async (data, user) => {
    const { request_id, action, action_stage, comments } = data;

    // Insert approval record
    const [result] = await pool.query(
        `INSERT INTO id_card_approvals (request_id, action_by, action_role, action, action_stage, comments)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [request_id, user.id, user.role, action, action_stage, comments || null]
    );

    // Update request status
    const newStatus = STATUS_MAP[action_stage]?.[action];
    if (newStatus) {
        await pool.query(
            `UPDATE id_card_requests SET current_status = ? WHERE id = ?`,
            [newStatus, request_id]
        );
    }

    return { id: result.insertId, newStatus };
};

const getTimeline = async (request_id) => {
    const [rows] = await pool.query(
        `SELECT a.*, u.full_name AS action_by_name
     FROM id_card_approvals a
     LEFT JOIN users u ON a.action_by = u.id
     WHERE a.request_id = ? ORDER BY a.created_at ASC`,
        [request_id]
    );
    return rows;
};

module.exports = { getByRequest, create, getTimeline };
