require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'your _fallback_secret_key',
    expiresIn: '1h'
};