const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Faq = require('../models/faqModel');

const listUsers = async (req, res) => {
  try {
    const users = await Admin.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load users' });
  }
};

const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, status } = req.body || {};

    if (!first_name || !String(first_name).trim() || !last_name || !String(last_name).trim()) {
      return res.status(400).json({ error: 'First and last name are required' });
    }

    const emailStr = String(email || '').trim();
    if (!emailStr || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailStr)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const roleValue = role || 'user';
    if (!['user', 'admin'].includes(roleValue)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const statusValue = status || 'active';
    if (!['active', 'disabled'].includes(statusValue)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = await User.findUserByEmail(emailStr);
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const result = await Admin.createUser({
      email: emailStr,
      password: String(password),
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      role: roleValue,
      status: statusValue
    });

    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'user_create',
      details: { userId: result.insertId, role: roleValue, status: statusValue },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      message: 'User created',
      user: {
        id: result.insertId,
        email: emailStr,
        first_name: String(first_name).trim(),
        last_name: String(last_name).trim(),
        role: roleValue,
        status: statusValue
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { first_name, last_name, email, role, status } = req.body || {};
    const updates = {};

    if (first_name !== undefined) {
      if (!first_name || !String(first_name).trim()) {
        return res.status(400).json({ error: 'First name is required' });
      }
      updates.first_name = String(first_name).trim();
    }

    if (last_name !== undefined) {
      if (!last_name || !String(last_name).trim()) {
        return res.status(400).json({ error: 'Last name is required' });
      }
      updates.last_name = String(last_name).trim();
    }

    if (email !== undefined) {
      const emailStr = String(email).trim();
      if (!emailStr || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailStr)) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      updates.email = emailStr;
    }

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.role = role;
    }

    if (status !== undefined) {
      if (!['active', 'disabled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = status;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    await Admin.updateUser(req.params.id, updates);
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'user_update',
      details: { userId: req.params.id, updates },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'User updated' });
  } catch (error) {
    if (error.code === 'MISSING_COLUMNS') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await Admin.updateUser(req.params.id, { role });
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'role_change',
      details: { userId: req.params.id, role },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'Role updated' });
  } catch (error) {
    if (error.code === 'MISSING_COLUMNS') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update role' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await Admin.updateUser(req.params.id, { status });
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'status_change',
      details: { userId: req.params.id, status },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'Status updated' });
  } catch (error) {
    if (error.code === 'MISSING_COLUMNS') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update status' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!targetId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (Number(req.userId) === targetId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    await Admin.deleteUser(targetId);
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'user_delete',
      details: { userId: targetId },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const revokeSessions = async (req, res) => {
  try {
    await Admin.incrementSessionVersion(req.params.id);
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'revoke_sessions',
      details: { userId: req.params.id },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'Sessions revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke sessions' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await Admin.getAuditLogs(req.query.limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load audit logs' });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Admin.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = req.body || {};
    const allowedKeys = ['defaults', 'features', 'maintenance', 'security'];

    for (const key of Object.keys(updates)) {
      if (allowedKeys.includes(key)) {
        await Admin.updateSetting(key, updates[key], req.userId);
      }
    }

    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'settings_update',
      details: { keys: Object.keys(updates) },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const fresh = await Admin.getSettings();
    res.json(fresh);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

const listIpRules = async (req, res) => {
  try {
    const rules = await Admin.getIpRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load IP rules' });
  }
};

const addIpRule = async (req, res) => {
  try {
    const { ip, type, description } = req.body;
    if (!ip || !type || !['allow', 'deny'].includes(type)) {
      return res.status(400).json({ error: 'Invalid IP rule' });
    }

    const id = await Admin.addIpRule({
      ip,
      ruleType: type,
      description,
      createdBy: req.userId
    });

    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'ip_rule_add',
      details: { id, ip, type },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add IP rule' });
  }
};

const deleteIpRule = async (req, res) => {
  try {
    await Admin.deleteIpRule(req.params.id);
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'ip_rule_remove',
      details: { id: req.params.id },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'IP rule removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove IP rule' });
  }
};

const listFaqQuestions = async (req, res) => {
  try {
    const status = req.query.status;
    const questions = await Faq.listQuestions({ status });
    res.json(questions);
  } catch (error) {
    console.error('Error loading FAQ questions:', error.message || error);
    res.status(500).json({ error: 'Failed to load FAQ questions', details: error.message });
  }
};

const updateFaqQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.id);
    if (!questionId) {
      return res.status(400).json({ error: 'Invalid question id' });
    }

    const current = await Faq.getQuestionById(questionId);
    if (!current) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const { answer, is_published, status } = req.body || {};
    const updates = {};

    if (answer !== undefined) {
      const answerText = String(answer || '').trim();
      if (!answerText) {
        return res.status(400).json({ error: 'Answer is required' });
      }
      updates.answer = answerText;
      updates.answered_by = req.userId;
      updates.answered_at = new Date();
      if (status === undefined) {
        updates.status = 'answered';
      }
    }

    if (status !== undefined) {
      if (!['open', 'answered', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = status;
    }

    if (is_published !== undefined) {
      const publish =
        is_published === true ||
        is_published === 'true' ||
        is_published === 1 ||
        is_published === '1';
      const unpublish =
        is_published === false ||
        is_published === 'false' ||
        is_published === 0 ||
        is_published === '0';

      if (!publish && !unpublish) {
        return res.status(400).json({ error: 'Invalid publish flag' });
      }

      const nextPublishValue = publish ? 1 : 0;
      const nextAnswer = updates.answer !== undefined ? updates.answer : current.answer;
      if (nextPublishValue === 1 && !nextAnswer) {
        return res.status(400).json({ error: 'Answer required before publishing' });
      }
      updates.is_published = nextPublishValue;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    await Faq.updateQuestion(questionId, updates);
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'faq_update',
      details: { questionId, updates },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'FAQ updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
};

module.exports = {
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
};
