const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const pool = require ('../config/db');

router.use(authenticate);

// Get all tasks
router.get('/', getTasks);

// Create a new task
router.post('/', addTask);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

  // Add this route before module.exports
router.get('/stats', async (req, res) => {
  try {
    const [total] = await pool.query(
      'SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?',
      [req.userId]
    );
    const [completed] = await pool.query(
      'SELECT COUNT(*) AS completed FROM tasks WHERE user_id = ? AND status = "completed"',
      [req.userId]
    );
    
    res.json({
      total: total[0].total,
      completed: completed[0].completed,
      inProgress: total[0].total - completed[0].completed,
      overdue: 0 // Add your overdue logic
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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