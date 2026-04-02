const { pool } = require('../config/db');

// Status Map: Key is current_status, value is map of action -> newStatus
const STATUS_MAP = {
    SUBMITTED: {
        APPROVED: 'GMMC_APPROVED',
        REJECTED: 'GMMC_REJECTED',
    },
    GMMC_APPROVED: {
        APPROVED: 'PRINTER_APPROVED',
        REJECTED: 'GMMC_REJECTED', // Goes back to GMMC stage (maybe they need to pick another printer?)
    },
    PRINTER_APPROVED: {
        // Status typically updated by Sample Upload API
        APPROVED: 'SAMPLE_UPLOADED',
        REJECTED: 'GMMC_APPROVED',
    },
    SAMPLE_UPLOADED: {
        APPROVED: 'SCHOOL_VERIFIED',
        REJECTED: 'PRINTER_APPROVED', // Back to printer to fix and re-upload sample
    },
    SCHOOL_VERIFIED: {
        APPROVED: 'GMMC_VERIFIED',
        REJECTED: 'SAMPLE_UPLOADED', // GMMC found issues school missed? Back to school/printer.
    },
    GMMC_VERIFIED: {
        // Status typically updated by Dispatch API
        APPROVED: 'DISPATCHED',
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

    // Update request status based on current stage and action
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
