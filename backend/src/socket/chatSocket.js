const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { secret } = require('../config/jwt');
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

const setupChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, secret);
      const [rows] = await pool.query(
        'SELECT id, email, role, status FROM users WHERE id = ? LIMIT 1',
        [decoded.id]
      );

      if (!rows.length) {
        return next(new Error('User not found'));
      }

      if (rows[0].status === 'disabled') {
        return next(new Error('User disabled'));
      }

      socket.user = {
        id: rows[0].id,
        email: rows[0].email,
        role: rows[0].role || 'user'
      };

      return next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_board', async (payload = {}) => {
      const boardId = Number(payload.boardId);
      if (!Number.isInteger(boardId) || boardId <= 0) {
        socket.emit('chat_error', { message: 'Invalid board id' });
        return;
      }

      const canAccess = await hasBoardAccess(boardId, socket.user.id);
      if (!canAccess) {
        socket.emit('chat_error', { message: 'Board access denied' });
        return;
      }

      socket.join(`board:${boardId}`);
      socket.emit('joined_board', { boardId });
    });

    socket.on('leave_board', (payload = {}) => {
      const boardId = Number(payload.boardId);
      if (Number.isInteger(boardId) && boardId > 0) {
        socket.leave(`board:${boardId}`);
      }
    });

    socket.on('send_board_message', async (payload = {}) => {
      try {
        const boardId = Number(payload.boardId);
        const message = String(payload.message || '').trim();

        if (!Number.isInteger(boardId) || boardId <= 0) {
          socket.emit('chat_error', { message: 'Invalid board id' });
          return;
        }

        if (!message) {
          socket.emit('chat_error', { message: 'Message is required' });
          return;
        }

        const canAccess = await hasBoardAccess(boardId, socket.user.id);
        if (!canAccess) {
          socket.emit('chat_error', { message: 'Board access denied' });
          return;
        }

        const createdMessage = await ChatMessage.create({
          boardId,
          userId: socket.user.id,
          authorEmail: socket.user.email,
          message
        });

        io.to(`board:${boardId}`).emit('board_message', createdMessage);
      } catch (error) {
        socket.emit('chat_error', { message: 'Failed to send message' });
      }
    });
  });
};

module.exports = setupChatSocket;