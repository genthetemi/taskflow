const Admin = require('../models/adminModel');

const listUsers = async (req, res) => {
  try {
    const users = await Admin.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load users' });
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

const forcePasswordReset = async (req, res) => {
  try {
    await Admin.updateUser(req.params.id, { force_password_reset: 1 });
    await Admin.addAuditLog({
      actorUserId: req.userId,
      action: 'force_password_reset',
      details: { userId: req.params.id },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: 'Password reset required on next login' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to force password reset' });
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

module.exports = {
  listUsers,
  updateUserRole,
  updateUserStatus,
  forcePasswordReset,
  revokeSessions,
  getAuditLogs,
  getSettings,
  updateSettings,
  listIpRules,
  addIpRule,
  deleteIpRule
};
