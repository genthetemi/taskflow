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

const findUserById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};

const updateUserFields = async (id, fields) => {
    const keys = Object.keys(fields).filter(key => fields[key] !== undefined);
    if (!keys.length) return;

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => fields[key]);
    values.push(id);

    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
};

const setPasswordResetCode = async (userId, codeHash, expiresAt) => {
    await pool.query(
        'UPDATE users SET password_reset_code_hash = ?, password_reset_expires_at = ?, password_reset_used = 0 WHERE id = ?',
        [codeHash, expiresAt, userId]
    );
};

const clearPasswordResetCode = async (userId) => {
    await pool.query(
        'UPDATE users SET password_reset_code_hash = NULL, password_reset_expires_at = NULL WHERE id = ?',
        [userId]
    );
};

const markPasswordResetCodeUsed = async (userId) => {
    await pool.query(
        'UPDATE users SET password_reset_used = 1 WHERE id = ?',
        [userId]
    );
};

const updatePassword = async (userId, plainPassword) => {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await pool.query(
        `UPDATE users
         SET password = ?,
             failed_login_count = 0,
             lock_until = NULL,
             session_version = COALESCE(session_version, 0) + 1,
             password_reset_code_hash = NULL,
             password_reset_expires_at = NULL,
             password_reset_used = 1
         WHERE id = ?`,
        [hashedPassword, userId]
    );
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserFields,
    setPasswordResetCode,
    clearPasswordResetCode,
    markPasswordResetCodeUsed,
    updatePassword,
};