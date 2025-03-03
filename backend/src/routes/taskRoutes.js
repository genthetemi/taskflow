const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskcontroller');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Task = require('../models/taskModel');

router.use(authenticate);

// Get all tasks
router.get('/', (req, res) => {
  Task.getAllTasks(req.userId, req.query.board_id)
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

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all user's tasks
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */