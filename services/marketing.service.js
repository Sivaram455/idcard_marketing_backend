const { pool } = require('../config/db');

// --- Schools ---

const createSchool = async (data) => {
    const { school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments } = data;
    const [result] = await pool.query(
        `INSERT INTO schools (school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments]
    );
    return result.insertId;
};

const getAllSchools = async () => {
    const [rows] = await pool.query('SELECT * FROM schools ORDER BY created_at DESC');
    return rows;
};

const getSchoolById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM schools WHERE id = ?', [id]);
    return rows[0];
};

const updateSchool = async (id, data) => {
    const { school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments, status } = data;
    const [result] = await pool.query(
        `UPDATE schools SET school_name=?, contact_person1=?, contact_person2=?, mobile=?, email=?, address=?, city=?, state=?, comments=?, status=?
         WHERE id = ?`,
        [school_name, contact_person1, contact_person2, mobile, email, address, city, state, comments, status, id]
    );
    return result.affectedRows;
};

const deleteSchool = async (id) => {
    const [result] = await pool.query('DELETE FROM schools WHERE id = ?', [id]);
    return result.affectedRows;
};

// --- Agent Schools ---

const assignSchoolToAgent = async (agent_id, school_id, assigned_date) => {
    const [result] = await pool.query(
        `INSERT INTO agent_schools (agent_id, school_id, assigned_date)
         VALUES (?, ?, ?)`,
        [agent_id, school_id, assigned_date || new Date()]
    );
    return result.insertId;
};

const getSchoolsByAgent = async (agent_id) => {
    const [rows] = await pool.query(
        `SELECT s.*, asch.assigned_date 
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
    const [result] = await pool.query(
        `INSERT INTO school_activities (school_id, agent_id, activity_type, comments, visit_date, next_followup_date, reminder_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [school_id, agent_id, activity_type, comments, visit_date, next_followup_date, reminder_time]
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
         WHERE sa.agent_id = ? AND sa.status = 'pending' AND sa.next_followup_date IS NOT NULL
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
         WHERE sa.status = 'pending' AND sa.next_followup_date IS NOT NULL
         ORDER BY sa.next_followup_date ASC`
    );
    return rows;
};

const updateActivityStatus = async (id, status) => {
    const [result] = await pool.query('UPDATE school_activities SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
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
    updateActivityStatus
};
