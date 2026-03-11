const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role ? req.user.role.toUpperCase() : '';
        const allowedRoles = roles.map(r => r.toUpperCase());

        // Super admin can access anything
        if (userRole === 'ADMIN' || userRole === 'GMMC_ADMIN') {
            return next();
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

module.exports = { authenticate, authorizeRoles };
