const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { getBoardMessages, addBoardMessage } = require('../controllers/chatController');

const router = express.Router();

router.use(authenticate);

router.get('/boards/:boardId/messages', getBoardMessages);
router.post('/boards/:boardId/messages', addBoardMessage);

module.exports = router;