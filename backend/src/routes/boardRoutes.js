// routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard
} = require('../controllers/boardController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Boards
 *   description: Board management
 */

/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Create a new board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 * 
 *   get:
 *     summary: Get all user's boards
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of boards
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
 *         description: Numeric ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               board_id:
 *                 type: integer
 *               due_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Task updated"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid status value"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             example:
 *               error: "Task not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               error: "Database connection failed"

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
 *         description: Numeric ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Task deleted"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             example:
 *               error: "Task not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               error: "Database connection failed"
 */