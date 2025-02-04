const pool = require('../config/db');

// Get all tasks
const getAllTasks = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ?', // Check this query
      [userId]
    );
    return rows;
  } catch (error) {
    console.error("Database error in getAllTasks:", error); // Add logging
    throw new Error('Error fetching tasks');
  }
};

// Create a new task
// models/taskModel.js
const createTask = async (task, userId) => {
  const { title, description, status } = task;
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)',
      [title, description || null, status || 'pending', userId]
    );
    return result;
  } catch (error) {
    console.error("Database error in createTask:", error); // Log the error
    throw new Error('Error creating task');
  }
};

// Update a task
const updateTask = async (id, task) => {
  const { title, description, status } = task;
  if (!id) {
    throw new Error('Task ID is required');
  }

  try {
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?',
      [title, description, status, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Task not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error updating task');
  }
};

// Delete a task
const deleteTask = async (id) => {
  if (!id) {
    throw new Error('Task ID is required');
  }

  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('Task not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error deleting task');
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};
