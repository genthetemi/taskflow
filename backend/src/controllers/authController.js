const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Fixed incorrect "bycrypt" typo
const User = require('../models/userModel');
const { secret, expiresIn } = require('../config/jwt');

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        await User.createUser(req.body);
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
