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

const getBoardById = async (id, userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT boards.*, users.email as owner_email 
       FROM boards 
       JOIN users ON boards.user_id = users.id
       WHERE boards.id = ? AND boards.user_id = ?`,
      [id, userId]
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
      `SELECT boards.*, COUNT(tasks.id) AS task_count 
       FROM boards 
       LEFT JOIN tasks ON boards.id = tasks.board_id
       WHERE boards.user_id = ?
       GROUP BY boards.id`,
      [userId]
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
  getBoardById,
  getAllBoards,
  updateBoard,
  deleteBoard
};