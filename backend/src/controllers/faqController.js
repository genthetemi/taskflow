const Faq = require('../models/faqModel');

const listPublishedFaqs = async (req, res) => {
  try {
    const faqs = await Faq.listPublishedFaqs();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
};

const submitQuestion = async (req, res) => {
  try {
    const { question } = req.body || {};
    const questionText = String(question || '').trim();

    if (!questionText) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (questionText.length < 10) {
      return res.status(400).json({ error: 'Question is too short' });
    }

    const result = await Faq.createQuestion({
      userId: req.userId,
      question: questionText
    });

    res.status(201).json({
      message: 'Question submitted',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit question' });
  }
};

module.exports = {
  listPublishedFaqs,
  submitQuestion
};
