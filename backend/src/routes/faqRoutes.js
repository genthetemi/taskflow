const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { listPublishedFaqs, submitQuestion } = require('../controllers/faqController');

router.get('/', listPublishedFaqs);
router.post('/questions', authenticate, submitQuestion);

module.exports = router;
