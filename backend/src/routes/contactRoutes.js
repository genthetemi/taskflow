const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Public contact form
 */

/**
 * @swagger
 * /api/contact/send:
 *   post:
 *     summary: Send contact form message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 *       400:
 *         description: Validation error
 *       500:
 *         description: Email send failed
 */
router.post('/send', sendContactEmail);

module.exports = router;
