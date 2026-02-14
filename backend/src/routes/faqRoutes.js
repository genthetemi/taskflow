const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { listPublishedFaqs, submitQuestion } = require('../controllers/faqController');

router.get('/', listPublishedFaqs);
router.post('/questions', authenticate, submitQuestion);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: FAQ
 *   description: FAQ and question submission
 */

/**
 * @swagger
 * /api/faq:
 *   get:
 *     summary: List published FAQs
 *     tags: [FAQ]
 *     responses:
 *       200:
 *         description: Published FAQs
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/faq/questions:
 *   post:
 *     summary: Submit a new FAQ question
 *     tags: [FAQ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       201:
 *         description: Question submitted
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
