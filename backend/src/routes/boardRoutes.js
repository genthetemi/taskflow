// routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const {
  createBoard,
  getBoards,
  getMyInvitations,
  respondToInvitation,
  getBoard,
  getBoardUsers,
  updateBoard,
  deleteBoard,
  inviteUserToBoard
} = require('../controllers/boardController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/invitations', getMyInvitations);
router.post('/invitations/:invitationId/respond', respondToInvitation);
router.get('/:id', getBoard);
router.get('/:id/users', getBoardUsers);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);
router.post('/:id/invite', inviteUserToBoard);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Boards
 *   description: Board management and invitations
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
 *             required: [name]
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
 *   get:
 *     summary: Get boards accessible by authenticated user
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
 * /api/boards/{id}:
 *   get:
 *     summary: Get a board by id
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 *
 * /api/boards/{id}/users:
 *   get:
 *     summary: Get users that can be assigned tasks on a board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Users on board (owner and members)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BoardUser'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Board updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/boards/{id}/invite:
 *   post:
 *     summary: Invite a user to board by email
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Invitation sent
 *       400:
 *         description: Invalid input or already member
 *       403:
 *         description: Only board owner can invite users
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/boards/invitations:
 *   get:
 *     summary: Get pending board invitations for current user
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pending invitations list
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/boards/invitations/{invitationId}/respond:
 *   post:
 *     summary: Accept or reject board invitation
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invitation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *     responses:
 *       200:
 *         description: Invitation handled
 *       400:
 *         description: Invalid request or already handled invitation
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
