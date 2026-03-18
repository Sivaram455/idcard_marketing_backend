const { pool } = require('../config/db');

exports.createTicket = async (req, res) => {
    try {
        const { title, description, priority, tenant_id, attachments } = req.body;
        const created_by = req.user.id;

        const [result] = await pool.query(
            'INSERT INTO tickets (title, description, priority, created_by, tenant_id) VALUES (?, ?, ?, ?, ?)',
            [title, description, priority || 'LOW', created_by, (tenant_id && tenant_id !== "0") ? tenant_id : null]
        );

        const ticketId = result.insertId;

        if (attachments && attachments.length > 0) {
            const attachmentValues = attachments.map(att => [
                ticketId,
                att.url || att.file_path,
                att.originalName || att.file_name,
                att.mimetype || att.file_type || ''
            ]);

            await pool.query(
                'INSERT INTO ticket_attachments (ticket_id, file_path, file_name, file_type) VALUES ?',
                [attachmentValues]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticketId
        });
    } catch (err) {
        console.error('❌ Error creating ticket:', err);
        res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
    }
};

exports.getTickets = async (req, res) => {
    try {
        const { role, id, tenant_id } = req.user;

        let query = 'SELECT t.*, u.full_name as creator_name, a.full_name as assignee_name, ten.tenant_name FROM tickets t JOIN users u ON t.created_by = u.id LEFT JOIN users a ON t.assigned_to = a.id LEFT JOIN tenants ten ON t.tenant_id = ten.id';
        let params = [];

        if (role === 'SUPPORT' || role === 'DEVELOPER' || role === 'admin' || role === 'GMMC_ADMIN') {
            // Can see all or might filter by role later
        } else if (role === 'school' || role === 'SCHOOL_ADMIN') {
            query += ' WHERE t.tenant_id = ?';
            params.push(tenant_id);
        } else {
            query += ' WHERE t.created_by = ?';
            params.push(id);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tickets] = await pool.query(query, params);

        res.json({
            success: true,
            tickets
        });
    } catch (err) {
        console.error('❌ Error getting tickets:', err);
        res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const [tickets] = await pool.query(
            'SELECT t.*, u.full_name as creator_name, a.full_name as assignee_name, ten.tenant_name FROM tickets t JOIN users u ON t.created_by = u.id LEFT JOIN users a ON t.assigned_to = a.id LEFT JOIN tenants ten ON t.tenant_id = ten.id WHERE t.id = ?',
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const [attachments] = await pool.query(
            'SELECT * FROM ticket_attachments WHERE ticket_id = ?',
            [id]
        );

        res.json({
            success: true,
            ticket: {
                ...tickets[0],
                attachments
            }
        });
    } catch (err) {
        console.error('❌ Error getting ticket:', err);
        res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assigned_to } = req.body;

        if (assigned_to) {
            const [user] = await pool.query('SELECT role FROM users WHERE id = ?', [assigned_to]);
            if (!user.length || user[0].role !== 'DEVELOPER') {
                return res.status(400).json({ success: false, message: 'Only developers can be assigned to tickets.' });
            }
        }

        const [result] = await pool.query(
            'UPDATE tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), assigned_to = COALESCE(?, assigned_to) WHERE id = ?',
            [status, priority, assigned_to, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Ticket updated successfully'
        });
    } catch (err) {
        console.error('❌ Error updating ticket:', err);
        res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
    }
};

exports.getDevelopers = async (req, res) => {
    try {
        const [devs] = await pool.query(
            "SELECT id, full_name, email FROM users WHERE role = 'DEVELOPER' AND status = 'ACTIVE' ORDER BY full_name"
        );
        res.json({ success: true, data: devs });
    } catch (err) {
        console.error('❌ Error getting developers:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
