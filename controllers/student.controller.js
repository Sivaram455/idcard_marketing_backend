const studentService = require('../services/student.service');

const getByRequest = async (req, res) => {
    try {
        const students = await studentService.getByRequest(req.params.request_id);
        return res.status(200).json({ success: true, data: students });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const bulkCreate = async (req, res) => {
    try {
        const { students, tenant_id, request_id } = req.body;
        const count = await studentService.bulkCreate(students, tenant_id, request_id);
        return res.status(201).json({
            success: true,
            message: `${count} students added successfully.`,
            data: { count }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const student = await studentService.getById(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        return res.status(200).json({ success: true, data: student });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const createSingle = async (req, res) => {
    try {
        const id = await studentService.createSingle(req.body);
        return res.status(201).json({ success: true, message: 'Student added.', data: { id } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await studentService.remove(req.params.id);
        return res.status(200).json({ success: true, message: 'Student deleted.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getByRequest, bulkCreate, getById, createSingle, remove };
