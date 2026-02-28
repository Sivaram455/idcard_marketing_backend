const { pool } = require('../config/db');

const getByRequest = async (request_id) => {
    const [rows] = await pool.query(
        `SELECT * FROM students WHERE request_id = ? ORDER BY admission_no ASC`,
        [request_id]
    );
    return rows;
};

const bulkCreate = async (students, tenant_id, request_id) => {
    if (!students || students.length === 0) return 0;

    const values = students.map(s => [
        tenant_id, request_id,
        s.admission_no, s.roll_no || null,
        s.first_name, s.last_name || null,
        s.class || null, s.section || null,
        s.dob || null, s.blood_group || null,
        s.photo_file_name || null, s.photo_url || null,
        'ACTIVE'
    ]);

    const [result] = await pool.query(
        `INSERT INTO students 
     (tenant_id, request_id, admission_no, roll_no, first_name, last_name,
      class, section, dob, blood_group, photo_file_name, photo_url, status) 
     VALUES ?`,
        [values]
    );
    return result.affectedRows;
};

const createSingle = async (data) => {
    const { tenant_id, request_id, admission_no, roll_no, first_name, last_name, class: cls, section, dob, blood_group, photo_url } = data;
    const [result] = await pool.query(
        `INSERT INTO students (tenant_id, request_id, admission_no, roll_no, first_name, last_name, class, section, dob, blood_group, photo_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [tenant_id, request_id, admission_no, roll_no || null, first_name, last_name || null, cls || null, section || null, dob || null, blood_group || null, photo_url || null]
    );
    return result.insertId;
};

const remove = async (id) => {
    await pool.query(`DELETE FROM students WHERE id = ?`, [id]);
};

const getById = async (id) => {
    const [rows] = await pool.query(`SELECT * FROM students WHERE id = ?`, [id]);
    return rows[0] || null;
};

const updatePhoto = async (id, photo_url, photo_file_name) => {
    const [result] = await pool.query(
        `UPDATE students SET photo_url = ?, photo_file_name = ? WHERE id = ?`,
        [photo_url, photo_file_name, id]
    );
    return result.affectedRows;
};

module.exports = { getByRequest, bulkCreate, getById, updatePhoto, createSingle, remove };
