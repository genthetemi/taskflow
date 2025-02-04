const Task = require('../models/taskModel');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.getAllTasks(req.userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message); 
    res.status(500).json({ error: error.message }); 
  }
};


exports.addTask = async (req, res) => {
  try {
    const newTask = await Task.createTask(req.body, req.userId);
    res.status(201).json({ message: 'Task created', id: newTask.insertId });
  } catch (error) {
    console.error("Error creating task:", error.message); 
    res.status(500).json({ error: error.message }); // Return actual error message
  }
};

exports.updateTask = async (req, res) => {
  try {
    await Task.updateTask(req.params.id, req.body);
    res.status(200).json({ message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.deleteTask(req.params.id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
