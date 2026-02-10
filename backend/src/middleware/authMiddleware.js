const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const pool = require('../config/db');
const User = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try{
        const decoded = jwt.verify(token, secret);
        const user = await User.findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (user.status === 'disabled') {
            return res.status(403).json({ error: 'Account disabled' });
        }

        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            return res.status(423).json({ error: 'Account locked. Try again later.' });
        }

        const tokenVersion = Number.isNaN(Number(decoded.session_version)) ? 0 : Number(decoded.session_version);
        if (user.session_version > tokenVersion) {
            return res.status(401).json({ error: 'Session revoked. Please log in again.' });
        }

        const [rows] = await pool.query('SELECT `value` FROM system_settings WHERE `key` = ?', ['maintenance']);
        if (rows.length) {
            const maintenance = JSON.parse(rows[0].value || '{}');
            if (maintenance.enabled && user.role !== 'admin') {
                return res.status(503).json({ error: maintenance.message || 'Maintenance mode enabled' });
            }
        }

        req.userId = user.id;
        req.userRole = user.role || 'user';
        req.userEmail = user.email;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};