const pool = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (user) => {
    const { email, password, first_name, last_name } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        // Attempt to store first and last name if provided
        const [result] = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
            [first_name || '', last_name || '', email, hashedPassword]
        );
        return result;
    } catch (error) {
        // If the database doesn't have name columns, fall back to inserting only email and password
        console.warn('Insert with name columns failed, attempting fallback insert:', error.code || error.sqlMessage);
        if (error && error.code === 'ER_BAD_FIELD_ERROR') {
            const [result] = await pool.query(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword]
            );
            return result;
        }

        console.error('Error creating user:', error);
        // Re-throw to be handled by controller
        throw error;
    }
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
};