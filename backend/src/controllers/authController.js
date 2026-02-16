const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Fixed incorrect "bycrypt" typo
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const { secret, expiresIn } = require('../config/jwt');

const resetCodeExpiryMinutes = Number(process.env.PASSWORD_RESET_CODE_EXPIRY_MINUTES || 2);
const gmailUser = String(process.env.GMAIL_USER || '').trim();
const gmailAppPassword = String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();
const hasGmailConfig = Boolean(gmailUser && gmailAppPassword);
const isLikelyGoogleAppPassword = /^[A-Za-z0-9]{16}$/.test(gmailAppPassword);
const resetRequestWindowMs = Number(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const resetRequestMaxAttempts = Number(process.env.PASSWORD_RESET_RATE_LIMIT_MAX || 3);
const resetRequestAttempts = new Map();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailUser,
        pass: gmailAppPassword
    }
});

const formatMySqlDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join('-') + ' ' + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ].join(':');
};

const hashResetCode = async (code) => bcrypt.hash(code, 10);
const isStrongPassword = (password) => String(password || '').length >= 8;

const isResetRateLimited = (key) => {
    const now = Date.now();
    const history = resetRequestAttempts.get(key) || [];
    const recent = history.filter((timestamp) => now - timestamp < resetRequestWindowMs);

    if (recent.length >= resetRequestMaxAttempts) {
        resetRequestAttempts.set(key, recent);
        return true;
    }

    recent.push(now);
    resetRequestAttempts.set(key, recent);
    return false;
};

const getAuthenticatedUserFromRequest = async (req) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findUserById(decoded.id);

        if (!user) {
            return null;
        }

        if (user.status === 'disabled') {
            return null;
        }

        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            return null;
        }

        const tokenVersion = Number.isNaN(Number(decoded.session_version)) ? 0 : Number(decoded.session_version);
        if ((user.session_version || 0) > tokenVersion) {
            return null;
        }

        return user;
    } catch (error) {
        return null;
    }
};

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
            const remainingMs = new Date(user.lock_until).getTime() - Date.now();
            const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
            return res.status(423).json({
                error: `Account locked. Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`
            });
        }

        // 🔍 Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Incorrect password for user:', email);
            const settings = await Admin.getSettings();
            const security = settings.security || { lockAfterFailed: 5, lockMinutes: 15 };
            const maxAttempts = Number(security.lockAfterFailed || 5);
            const lockMinutes = Number(security.lockMinutes || 15);
            const failedCount = (user.failed_login_count || 0) + 1;
            const shouldLock = failedCount >= maxAttempts;
            const lockUntil = shouldLock
                ? new Date(Date.now() + lockMinutes * 60 * 1000)
                : null;

            await User.updateUserFields(user.id, {
                failed_login_count: failedCount,
                lock_until: lockUntil ? formatMySqlDateTime(lockUntil) : null
            });

            if (shouldLock) {
                return res.status(423).json({
                    error: `Account locked. Try again in ${lockMinutes} minute${lockMinutes === 1 ? '' : 's'}.`
                });
            }

            const remaining = Math.max(0, maxAttempts - failedCount);
            return res.status(401).json({
                error: `Invalid Credentials. Attempts left: ${remaining}.`
            });
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
            last_login_at: formatMySqlDateTime(new Date())
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
                role: user.role || 'user'
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const requestedEmail = String(req.body?.email || '').trim().toLowerCase();
        const authenticatedUser = await getAuthenticatedUserFromRequest(req);
        const email = authenticatedUser ? String(authenticatedUser.email || '').trim().toLowerCase() : requestedEmail;
        const rateLimitKey = authenticatedUser ? `${req.ip}:user:${authenticatedUser.id}` : `${req.ip}:${email}`;

        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        if (authenticatedUser && requestedEmail && requestedEmail !== email) {
            return res.status(403).json({ error: 'You can only request password reset for your own account email' });
        }

        if (isResetRateLimited(rateLimitKey)) {
            return res.status(429).json({ error: 'Too many reset requests. Please try again later.' });
        }

        if (!hasGmailConfig) {
            console.error('Password reset email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
            return res.status(503).json({ error: 'Password reset service is temporarily unavailable' });
        }

        if (!isLikelyGoogleAppPassword) {
            return res.status(503).json({
                error: 'Invalid Google App Password format. Use a 16-character App Password from your Google Account.'
            });
        }

        const user = await User.findUserByEmail(email);

        if (user) {
            const code = String(crypto.randomInt(100000, 1000000));
            const codeHash = await hashResetCode(code);
            const expiresAt = new Date(Date.now() + resetCodeExpiryMinutes * 60 * 1000);

            await User.setPasswordResetCode(user.id, codeHash, formatMySqlDateTime(expiresAt));

            const mailOptions = {
                from: gmailUser,
                to: user.email,
                subject: 'TaskFlow password reset code',
                html: `
                  <h2>Password reset verification</h2>
                  <p>Use this verification code to reset your password:</p>
                  <h1 style="letter-spacing: 4px;">${code}</h1>
                  <p>This code expires in ${resetCodeExpiryMinutes} minutes.</p>
                  <p>If you did not request this, you can ignore this email.</p>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (mailError) {
                console.error('Password reset email failed:', mailError);
                await User.clearPasswordResetCode(user.id);

                if (mailError && (mailError.responseCode === 535 || /BadCredentials|Username and Password not accepted/i.test(mailError.message || ''))) {
                    return res.status(503).json({
                        error: 'Email authentication failed. Update GMAIL_USER and GMAIL_APP_PASSWORD (Google App Password).'
                    });
                }

                return res.status(503).json({ error: 'Unable to send reset email right now. Please try again later.' });
            }
        }

        return res.status(200).json({
            message: 'If the email exists, a verification code has been sent.'
        });
    } catch (error) {
        console.error('requestPasswordReset Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.resetPasswordWithCode = async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const code = String(req.body?.code || '').trim();
        const newPassword = String(req.body?.new_password || '');

        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, code, and new password are required' });
        }

        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ error: 'Verification code must be 6 digits' });
        }

        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters'
            });
        }

        const user = await User.findUserByEmail(email);
        if (!user || !user.password_reset_code_hash || !user.password_reset_expires_at || Number(user.password_reset_used) === 1) {
            return res.status(400).json({ error: 'Invalid or expired reset request' });
        }

        if (new Date(user.password_reset_expires_at) < new Date()) {
            await User.clearPasswordResetCode(user.id);
            return res.status(400).json({ error: 'Code expired. Request a new one.' });
        }

        const isMatch = await bcrypt.compare(code, user.password_reset_code_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        await User.markPasswordResetCodeUsed(user.id);
        await User.updatePassword(user.id, newPassword);

        return res.status(200).json({ message: 'Password reset successful. Please sign in.' });
    } catch (error) {
        console.error('resetPasswordWithCode Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
