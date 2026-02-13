const pool = require('../config/db');

// Get all tasks for a board
const getAllTasks = async (boardId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE board_id = ?', [boardId]);
    return rows;
  } catch (error) {
    console.error("Database error in getAllTasks:", error);
    throw new Error('Error fetching tasks');
  }
};

// Create a new task with board association
const createTask = async (task, userId) => {
  const { title, description, status, priority, due_date, board_id } = task;

  if (!board_id) {
    throw new Error('Board ID is required');
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tasks 
       (title, description, status, priority, user_id, board_id, due_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        status || 'Pending',
        priority || 'Medium',
        userId,
        board_id,
        due_date || null
      ]
    );
    return result;
  } catch (error) {
    console.error("Database error in createTask:", error);
    throw new Error('Error creating task: ' + error.message);
  }
};

// Update a task (partial updates supported)
const updateTask = async (id, task) => {
  try {
    // Build dynamic SET clause for only provided fields
    const allowedFields = ['title', 'description', 'status', 'priority', 'due_date', 'board_id'];
    const setClauses = [];
    const params = [];

    allowedFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(task, field)) {
        setClauses.push(`${field} = ?`);
        const value = task[field] === undefined ? null : task[field];
        params.push(value);
      }
    });

    if (setClauses.length === 0) {
      throw new Error('No fields provided to update');
    }

    const query = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`;
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      throw new Error('Task not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error updating task: ' + error.message);
  }
};

// Delete a task
const deleteTask = async (id) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      throw new Error('Task not found');
    }

    return result;
  } catch (error) {
    throw new Error('Error deleting task: ' + error.message);
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
};