const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { secret, expiresIn } = require('../config/jwt');

exports.register = async (req, res) =>{
    try {
        await User.createUser(req.body);
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } =
        req.body;
        const user = await User.findUserByEmail(email);

        if (!user || !(await bycrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        const token = jwt.sign({ id: user.id}, secret, { expiresIn });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};