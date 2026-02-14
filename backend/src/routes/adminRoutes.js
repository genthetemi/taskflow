const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  createUser,
  listUsers,
  updateUserDetails,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  revokeSessions,
  getAuditLogs,
  getSettings,
  updateSettings,
  listIpRules,
  addIpRule,
  deleteIpRule,
  listFaqQuestions,
  updateFaqQuestion
} = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.post('/users', createUser);
router.get('/users', listUsers);
router.patch('/users/:id', updateUserDetails);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/revoke-sessions', revokeSessions);

router.get('/faq-questions', listFaqQuestions);
router.patch('/faq-questions/:id', updateFaqQuestion);

router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/ip-rules', listIpRules);
router.post('/ip-rules', addIpRule);
router.delete('/ip-rules/:id', deleteIpRule);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations (admin role required)
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               status:
 *                 type: string
 *                 enum: [active, disabled]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user details
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string, format: email }
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               status:
 *                 type: string
 *                 enum: [active, disabled]
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Invalid user id or cannot delete self
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, disabled]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/users/{id}/revoke-sessions:
 *   post:
 *     summary: Revoke all sessions for user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sessions revoked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/faq-questions:
 *   get:
 *     summary: List FAQ questions for moderation
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, answered, closed]
 *     responses:
 *       200:
 *         description: FAQ questions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/faq-questions/{id}:
 *   patch:
 *     summary: Update FAQ question answer/publication/status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [open, answered, closed]
 *     responses:
 *       200:
 *         description: FAQ question updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Audit logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Settings payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update system settings
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaults:
 *                 type: object
 *               features:
 *                 type: object
 *               maintenance:
 *                 type: object
 *               security:
 *                 type: object
 *     responses:
 *       200:
 *         description: Updated settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/ip-rules:
 *   get:
 *     summary: List IP rules
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: IP rules list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add IP rule
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ip, type]
 *             properties:
 *               ip:
 *                 type: string
 *                 example: 127.0.0.1
 *               type:
 *                 type: string
 *                 enum: [allow, deny]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rule created
 *       400:
 *         description: Invalid rule payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/ip-rules/{id}:
 *   delete:
 *     summary: Delete IP rule
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rule removed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       500:
 *         description: Server error
 */
