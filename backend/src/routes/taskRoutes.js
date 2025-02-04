const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskcontroller');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Task = require('../models/taskModel');

router.use(authenticate);

// Get all tasks
router.get('/', (req, res) => {
    Task.getAllTasks(req.userId) // Pass userId to model
      .then(tasks => res.json(tasks))
      .catch(error => res.status(500).json({ error }));
  });
  

// Create a new task
router.post('/', (req, res) => {
    Task.createTask(req.body, req.userId) // Pass userId to model
      .then(newTask => res.status(201).json({ message: 'Task created', id: newTask.insertId }))
      .catch(error => res.status(500).json({ error }));
  });

// Update a task
router.put('/:id', (req, res) => {
    Task.updateTask(req.params.id, req.body)
      .then(() => res.status(200).json({ message: 'Task updated' }))
      .catch(error => res.status(500).json({ error }));
  });

// Delete a task
router.delete('/:id', (req, res) => {
    Task.deleteTask(req.params.id)
      .then(() => res.status(200).json({ message: 'Task deleted' }))
      .catch(error => res.status(500).json({ error }));
  });

module.exports = router;
