const { pool } = require('../config/db');

// --- Schools ---

const createSchool = async (data) => {
    const { school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments, interested_in, studentscount, demorequire, Board } = data;
    const [result] = await pool.query(
        `INSERT INTO schools (school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments, interested_in, studnetscount, demorequire, Board)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments, interested_in, studentscount, demorequire, Board]
    );
    return result.insertId;
};

const getAllSchools = async () => {
    const [rows] = await pool.query(`
        SELECT DISTINCT s.*, s.studnetscount AS studentscount, u.full_name AS assigned_to_name
        FROM schools s
        LEFT JOIN users u ON s.assigned_to = u.id
        ORDER BY s.created_at DESC
    `);
    return rows;
};

const getSchoolById = async (id) => {
    const [rows] = await pool.query(`
        SELECT s.*, s.studnetscount AS studentscount, u.full_name AS assigned_to_name
        FROM schools s
        LEFT JOIN users u ON s.assigned_to = u.id
        WHERE s.id = ?
    `, [id]);
    return rows[0];
};

const updateSchool = async (id, data) => {
    const { school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments, status, interested_in, studentscount, demorequire, Board } = data;
    const [result] = await pool.query(
        `UPDATE schools SET school_name=?, contact_person1=?, contact_person2=?, mobile=?, email=?, address=?, city=?, state=?, comments=?, status=?, interested_in=?, studnetscount=?, demorequire=?, Board=?
         WHERE id = ?`,
        [school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments, status, interested_in, studentscount, demorequire, Board, id]
    );
    return result.affectedRows;
};

const deleteSchool = async (id) => {
    const [result] = await pool.query('DELETE FROM schools WHERE id = ?', [id]);
    return result.affectedRows;
};

// --- Agent Schools ---

const assignSchoolToAgent = async (agent_id, school_id, assigned_date) => {
    const date = assigned_date || new Date();
    // Insert into junction table
    const [result] = await pool.query(
        `INSERT INTO agent_schools (agent_id, school_id, assigned_date)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE agent_id = VALUES(agent_id), assigned_date = VALUES(assigned_date)`,
        [agent_id, school_id, date]
    );
    // Also update the schools table directly for easy querying
    await pool.query(
        `UPDATE schools SET assigned_to = ?, assigned_date = ? WHERE id = ?`,
        [agent_id, date, school_id]
    );
    return result.insertId;
};

const getSchoolsByAgent = async (agent_id) => {
    const [rows] = await pool.query(
        `SELECT DISTINCT s.*, s.studnetscount AS studentscount, asch.assigned_date 
         FROM schools s
         JOIN agent_schools asch ON s.id = asch.school_id
         WHERE asch.agent_id = ?
         ORDER BY s.created_at DESC`,
        [agent_id]
    );
    return rows;
};

// --- Activities ---

const createActivity = async (data) => {
    const { school_id, agent_id, activity_type, comments, visit_date, next_followup_date, reminder_time } = data;
    
    // Ensure next_followup_date is null if empty string
    const followUpDate = next_followup_date || null;
    
    const [result] = await pool.query(
        `INSERT INTO school_activities (school_id, agent_id, activity_type, comments, visit_date, next_followup_date, reminder_time, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [school_id, agent_id, activity_type, comments, visit_date, followUpDate, reminder_time]
    );
    
    // Update school status if activity is logged
    if (activity_type === 'visit') {
        await pool.query('UPDATE schools SET status = "visited" WHERE id = ?', [school_id]);
    } else if (activity_type === 'followup') {
        await pool.query('UPDATE schools SET status = "followup" WHERE id = ?', [school_id]);
    }

    return result.insertId;
};

const getActivitiesBySchool = async (school_id) => {
    const [rows] = await pool.query(
        `SELECT sa.*, u.full_name as agent_name 
         FROM school_activities sa
         LEFT JOIN users u ON sa.agent_id = u.id
         WHERE sa.school_id = ?
         ORDER BY sa.visit_date DESC`,
        [school_id]
    );
    return rows;
};

const getActivitiesByAgent = async (agent_id) => {
    const [rows] = await pool.query(
        `SELECT sa.*, s.school_name 
         FROM school_activities sa
         JOIN schools s ON sa.school_id = s.id
         WHERE sa.agent_id = ?
         ORDER BY sa.visit_date DESC`,
        [agent_id]
    );
    return rows;
};

const getAllActivities = async () => {
    const [rows] = await pool.query(
        `SELECT sa.*, s.school_name, u.full_name as agent_name 
         FROM school_activities sa
         JOIN schools s ON sa.school_id = s.id
         LEFT JOIN users u ON sa.agent_id = u.id
         ORDER BY sa.visit_date DESC`
    );
    return rows;
};

const getPendingFollowUps = async (agent_id) => {
    const [rows] = await pool.query(
        `SELECT sa.*, s.school_name, s.mobile, s.email
         FROM school_activities sa
         JOIN schools s ON sa.school_id = s.id
         WHERE sa.agent_id = ? 
         AND (sa.status = 'pending' OR sa.status IS NULL OR sa.status = '') 
         AND sa.next_followup_date IS NOT NULL
         ORDER BY sa.next_followup_date ASC`,
        [agent_id]
    );
    return rows;
};

const getAllPendingFollowUps = async () => {
    const [rows] = await pool.query(
        `SELECT sa.*, s.school_name, s.mobile, s.email, u.full_name as agent_name
         FROM school_activities sa
         JOIN schools s ON sa.school_id = s.id
         LEFT JOIN users u ON sa.agent_id = u.id
         WHERE (sa.status = 'pending' OR sa.status IS NULL OR sa.status = '') 
         AND sa.next_followup_date IS NOT NULL
         ORDER BY sa.next_followup_date ASC`
    );
    return rows;
};

const updateActivityStatus = async (id, status) => {
    const [result] = await pool.query('UPDATE school_activities SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
};

const getAgentStats = async (agent_id) => {
    const [agent] = await pool.query('SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = ?', [agent_id]);
    if (!agent[0]) return null;

    const [schools] = await pool.query('SELECT COUNT(*) as count FROM schools WHERE assigned_to = ?', [agent_id]);
    const [activities] = await pool.query('SELECT COUNT(*) as count FROM school_activities WHERE agent_id = ?', [agent_id]);
    const [visits] = await pool.query('SELECT COUNT(*) as count FROM school_activities WHERE agent_id = ? AND activity_type = "visit"', [agent_id]);
    const [followups] = await pool.query('SELECT COUNT(*) as count FROM school_activities WHERE agent_id = ? AND activity_type = "followup"', [agent_id]);
    const [pendingFollowups] = await pool.query('SELECT COUNT(*) as count FROM school_activities WHERE agent_id = ? AND (status = "pending" OR status IS NULL OR status = "") AND next_followup_date IS NOT NULL', [agent_id]);
    
    // Total orders booked by this agent's schools
    const [orders] = await pool.query(`
        SELECT COUNT(*) as count, SUM(total_amount) as total_revenue
        FROM marketing_orders o
        JOIN schools s ON o.school_id = s.id
        WHERE s.assigned_to = ?
    `, [agent_id]);

    return {
        profile: agent[0],
        stats: {
            assignedLeads: schools[0].count,
            totalActivities: activities[0].count,
            visits: visits[0].count,
            followups: followups[0].count,
            pendingFollowups: pendingFollowups[0].count,
            ordersBooked: orders[0].count,
            totalRevenue: orders[0].total_revenue || 0
        }
    };
};

const getGlobalStats = async () => {
    const [schools] = await pool.query('SELECT COUNT(*) as count FROM schools');
    const [activities] = await pool.query('SELECT COUNT(*) as count FROM school_activities');
    const [visits] = await pool.query('SELECT COUNT(*) as count FROM school_activities WHERE activity_type = "visit"');
    const [followups] = await pool.query('SELECT COUNT(*) as count FROM school_activities WHERE activity_type = "followup"');
    const [pendingFollowups] = await pool.query('SELECT COUNT(*) as count FROM school_activities WHERE (status = "pending" OR status IS NULL OR status = "") AND next_followup_date IS NOT NULL');
    
    const [orders] = await pool.query(`
        SELECT COUNT(*) as count, SUM(total_amount) as total_revenue
        FROM marketing_orders
    `);

    // Top performers (Lead closures)
    const [performers] = await pool.query(`
        SELECT u.full_name, COUNT(o.id) as orders_count, SUM(o.total_amount) as revenue
        FROM users u
        JOIN schools s ON s.assigned_to = u.id
        JOIN marketing_orders o ON o.school_id = s.id
        GROUP BY u.id
        ORDER BY revenue DESC
        LIMIT 5
    `);

    return {
        stats: {
            assignedLeads: schools[0].count,
            totalActivities: activities[0].count,
            visits: visits[0].count,
            followups: followups[0].count,
            pendingFollowups: pendingFollowups[0].count,
            ordersBooked: orders[0].count,
            totalRevenue: orders[0].total_revenue || 0
        },
        performers
    };
};

module.exports = {
    createSchool,
    getAllSchools,
    getSchoolById,
    updateSchool,
    deleteSchool,
    assignSchoolToAgent,
    getSchoolsByAgent,
    createActivity,
    getActivitiesBySchool,
    getActivitiesByAgent,
    getAllActivities,
    getPendingFollowUps,
    getAllPendingFollowUps,
    updateActivityStatus,
    getAgentStats,
    getGlobalStats
};
