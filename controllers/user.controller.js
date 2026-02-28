const userService = require('../services/user.service');

const getAll = async (req, res) => {
    try {
        const users = await userService.getAll();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await userService.getStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const id = await userService.create(req.body);
        res.status(201).json({ success: true, message: 'User created successfully.', data: { id } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const update = async (req, res) => {
    try {
        await userService.update(req.params.id, req.body);
        res.json({ success: true, message: 'User updated.' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }
        await userService.resetPassword(req.params.id, password);
        res.json({ success: true, message: 'Password reset successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, create, update, resetPassword, getStats };
