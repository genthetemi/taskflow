const Task = require('../models/taskModel');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    const newTask = await Task.createTask(req.body);
    res.status(201).json({ message: 'Task created', id: newTask.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
