const pool = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (user) => {
    const { email, password } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
    );
    return result;
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
};