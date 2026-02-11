const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

/**
 * POST /api/contact/send
 * Send a contact form message
 */
router.post('/send', sendContactEmail);

module.exports = router;
