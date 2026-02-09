const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Fixed incorrect "bycrypt" typo
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
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

        if (user.status === 'disabled') {
            return res.status(403).json({ error: 'Account disabled' });
        }

        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            return res.status(423).json({ error: 'Account locked. Try again later.' });
        }

        // 🔍 Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Incorrect password for user:', email);
            const settings = await Admin.getSettings();
            const security = settings.security || { lockAfterFailed: 5, lockMinutes: 15 };
            const failedCount = (user.failed_login_count || 0) + 1;
            const shouldLock = failedCount >= Number(security.lockAfterFailed || 5);
            const lockUntil = shouldLock
                ? new Date(Date.now() + Number(security.lockMinutes || 15) * 60 * 1000)
                : null;

            await User.updateUserFields(user.id, {
                failed_login_count: failedCount,
                lock_until: lockUntil ? lockUntil.toISOString().slice(0, 19).replace('T', ' ') : null
            });

            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        if (user.role === 'admin') {
            const rules = await Admin.getIpRulesForCheck();
            const clientIp = req.ip;
            const allowList = rules.filter(rule => rule.rule_type === 'allow').map(rule => rule.ip);
            const denyList = rules.filter(rule => rule.rule_type === 'deny').map(rule => rule.ip);

            if (denyList.includes(clientIp)) {
                return res.status(403).json({ error: 'Access denied from this IP' });
            }

            if (allowList.length && !allowList.includes(clientIp)) {
                return res.status(403).json({ error: 'Access restricted to allow-listed IPs' });
            }
        }

        const userAgent = req.headers['user-agent'] || null;
        const isNewLogin = user.last_login_ip && user.last_login_ip !== req.ip;
        const isNewDevice = user.last_login_user_agent && user.last_login_user_agent !== userAgent;

        if (isNewLogin || isNewDevice) {
            await Admin.addAuditLog({
                actorUserId: user.id,
                action: 'login_alert',
                details: { ip: req.ip, userAgent },
                ip: req.ip,
                userAgent
            });
        }

        await Admin.addAuditLog({
            actorUserId: user.id,
            action: 'login',
            details: { ip: req.ip },
            ip: req.ip,
            userAgent
        });

        await User.updateUserFields(user.id, {
            failed_login_count: 0,
            lock_until: null,
            last_login_ip: req.ip,
            last_login_user_agent: userAgent,
            last_login_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });

        // 🔥 Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role || 'user', session_version: user.session_version || 0 },
            secret,
            { expiresIn }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
                force_password_reset: !!user.force_password_reset
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
