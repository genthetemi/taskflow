const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Fixed incorrect "bycrypt" typo
const User = require('../models/userModel');
const { secret, expiresIn } = require('../config/jwt');

exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body;

        // Basic validation
        if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
            return res.status(400).json({ error: 'First and last name are required' });
        }
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const result = await User.createUser({ email, password, first_name: first_name.trim(), last_name: last_name.trim() });

        // Return created user info (without password)
        const createdUser = {
            id: result.insertId,
            email,
            first_name: first_name.trim(),
            last_name: last_name.trim()
        };

        res.status(201).json({ message: 'User registered successfully', user: createdUser });

    } catch (error) {
        console.error('Registration Error:', error);
        const details = error.code || error.sqlMessage || error.message;
        res.status(500).json({ error: 'Internal Server Error', details });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔍 Fetch user from database
        const user = await User.findUserByEmail(email);
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        // 🔍 Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Incorrect password for user:', email);
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        // 🔥 Generate JWT token
        const token = jwt.sign({ id: user.id }, secret, { expiresIn });

        res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
