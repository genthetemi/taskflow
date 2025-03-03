const Task = require('../models/taskModel');

exports.getTasks = async (req, res) => {
  try {
    const boardId = req.query.board_id;
    const tasks = await Task.getAllTasks(req.userId, boardId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
     // Validate required fields
     if (!req.body.title || !req.body.board_id) {
      return res.status(400).json({ 
        error: 'Title and Board ID are required' 
      });
    }

    // Verify board exists and belongs to user
    const [board] = await pool.query(
      'SELECT id FROM boards WHERE id = ? AND user_id = ?',
      [req.body.board_id, req.userId]
    );
    
    if (!board.length) {
      return res.status(404).json({ 
        error: 'Board not found or unauthorized' 
      });
    }

    const newTask = await Task.createTask(req.body, req.userId);
    res.status(201).json({ 
      message: 'Task created', 
      id: newTask.insertId,
      board_id: req.body.board_id 
    });
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    // Validate task exists and belongs to user
    const [existingTask] = await pool.query(
      'SELECT user_id FROM tasks WHERE id = ?',
      [req.params.id]
    );
    
    if (!existingTask.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Task.updateTask(req.params.id, req.body);
    res.status(200).json({ message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    // Validate task exists and belongs to user
    const [existingTask] = await pool.query(
      'SELECT user_id FROM tasks WHERE id = ?',
      [req.params.id]
    );
    
    if (!existingTask.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Task.deleteTask(req.params.id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};