const authService = require('../services/auth.service');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const result = await authService.login(email, password);
        return res.status(200).json({ success: true, message: 'Login successful.', data: result });
    } catch (err) {
        return res.status(401).json({ success: false, message: err.message });
    }
};

const getMe = async (req, res) => {
    return res.status(200).json({ success: true, data: req.user });
};

module.exports = { login, getMe };
