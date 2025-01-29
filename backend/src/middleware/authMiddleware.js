const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try{
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id; // Attach user ID to the request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};