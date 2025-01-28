const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskcontroller');
const express = require('express');

const router = express.Router();

// Get all tasks
router.get('/', getTasks);

// Create a new task
router.post('/', addTask);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
