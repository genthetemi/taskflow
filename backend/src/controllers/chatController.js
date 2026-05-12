const pool = require('../config/db');
const ChatMessage = require('../models/chatMessageModel');

const hasBoardAccess = async (boardId, userId) => {
  const [rows] = await pool.query(
    `SELECT b.id
     FROM boards b
     WHERE b.id = ?
       AND (
         b.user_id = ?
         OR EXISTS (
           SELECT 1 FROM board_members bm
           WHERE bm.board_id = b.id AND bm.user_id = ?
         )
       )
     LIMIT 1`,
    [boardId, userId, userId]
  );

  return rows.length > 0;
};

exports.getBoardMessages = async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    if (!Number.isInteger(boardId) || boardId <= 0) {
      return res.status(400).json({ error: 'Invalid board id' });
    }

    const canAccess = await hasBoardAccess(boardId, req.userId);
    if (!canAccess) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const messages = await ChatMessage.find({ boardId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Error fetching board chat messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch board chat messages' });
  }
};

exports.addBoardMessage = async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    const message = String(req.body.message || '').trim();

    if (!Number.isInteger(boardId) || boardId <= 0) {
      return res.status(400).json({ error: 'Invalid board id' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const canAccess = await hasBoardAccess(boardId, req.userId);
    if (!canAccess) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const createdMessage = await ChatMessage.create({
      boardId,
      userId: req.userId,
      authorEmail: req.userEmail || 'Unknown user',
      message
    });

    res.status(201).json(createdMessage);
  } catch (error) {
    console.error('Error creating board chat message:', error.message);
    res.status(500).json({ error: 'Failed to create board chat message' });
  }
};