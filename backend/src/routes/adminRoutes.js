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
