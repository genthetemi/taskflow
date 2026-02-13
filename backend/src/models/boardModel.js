// models/boardModel.js
const pool = require('../config/db');

const createBoard = async (board, userId) => {
  const { name, description } = board;
  try {
    const [result] = await pool.query(
      'INSERT INTO boards (name, description, user_id) VALUES (?, ?, ?)',
      [name, description, userId]
    );
    return result;
  } catch (error) {
    console.error("Database error in createBoard:", error);
    throw new Error('Error creating board');
  }
};

const isBoardOwner = async (boardId, userId) => {
  const [rows] = await pool.query(
    'SELECT id FROM boards WHERE id = ? AND user_id = ? LIMIT 1',
    [boardId, userId]
  );
  return rows.length > 0;
};

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

const addBoardMember = async (boardId, memberUserId, createdBy, role = 'member') => {
  const [result] = await pool.query(
    `INSERT INTO board_members (board_id, user_id, role, created_by)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE role = VALUES(role)`,
    [boardId, memberUserId, role, createdBy]
  );
  return result;
};

const getBoardById = async (id, userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT boards.*, users.email as owner_email,
              CASE WHEN boards.user_id = ? THEN 'owner' ELSE COALESCE(bm.role, 'member') END AS access_role
       FROM boards 
       JOIN users ON boards.user_id = users.id
       LEFT JOIN board_members bm ON bm.board_id = boards.id AND bm.user_id = ?
       WHERE boards.id = ?
         AND (
           boards.user_id = ?
           OR bm.user_id = ?
         )`,
      [userId, userId, id, userId, userId]
    );
    
    console.log('Query Result:', rows); // Add debug log
    return rows[0];
    
  } catch (error) {
    console.error("Database error details:", {
      errorCode: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    throw new Error('Error fetching board: ' + error.message);
  }
};

const getAllBoards = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT boards.*,
              users.email AS owner_email,
              CASE WHEN boards.user_id = ? THEN 'owner' ELSE COALESCE(bm.role, 'member') END AS access_role,
              (
                SELECT COUNT(*)
                FROM tasks
                WHERE tasks.board_id = boards.id
              ) AS task_count
       FROM boards 
       JOIN users ON boards.user_id = users.id
       LEFT JOIN board_members bm ON bm.board_id = boards.id AND bm.user_id = ?
       WHERE boards.user_id = ? OR bm.user_id = ?
       GROUP BY boards.id, users.email, bm.role`,
      [userId, userId, userId, userId]
    );
    return rows;
  } catch (error) {
    console.error("Database error in getAllBoards:", error);
    throw new Error('Error fetching boards');
  }
};

const updateBoard = async (id, board) => {
  const { name, description } = board;
  try {
    const [result] = await pool.query(
      'UPDATE boards SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result;
  } catch (error) {
    console.error("Database error in updateBoard:", error);
    throw new Error('Error updating board');
  }
};

const deleteBoard = async (id) => {
  try {
    await pool.query('DELETE FROM board_members WHERE board_id = ?', [id]);
    await pool.query('DELETE FROM tasks WHERE board_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM boards WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error("Database error in deleteBoard:", error);
    throw new Error('Error deleting board');
  }
};

module.exports = {
  createBoard,
  isBoardOwner,
  hasBoardAccess,
  addBoardMember,
  getBoardById,
  getAllBoards,
  updateBoard,
  deleteBoard
};