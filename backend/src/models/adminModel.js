const pool = require('../config/db');

const getUsers = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, role, status, force_password_reset, failed_login_count, lock_until, last_login_ip, last_login_at FROM users ORDER BY id DESC'
    );
    return rows;
  } catch (error) {
    if (error && error.code === 'ER_BAD_FIELD_ERROR') {
      const [rows] = await pool.query(
        'SELECT id, email FROM users ORDER BY id DESC'
      );
      return rows.map(row => ({
        ...row,
        first_name: '',
        last_name: '',
        role: 'user',
        status: 'active',
        force_password_reset: 0,
        failed_login_count: 0,
        lock_until: null,
        last_login_ip: null,
        last_login_at: null
      }));
    }
    throw error;
  }
};

const updateUser = async (userId, fields) => {
  const keys = Object.keys(fields).filter(key => fields[key] !== undefined);
  if (!keys.length) return;

  const setClause = keys.map(key => `${key} = ?`).join(', ');
  const values = keys.map(key => fields[key]);
  values.push(userId);

  try {
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
  } catch (error) {
    if (error && error.code === 'ER_BAD_FIELD_ERROR') {
      const customError = new Error('Missing user columns. Run DB setup to add role/status fields.');
      customError.code = 'MISSING_COLUMNS';
      throw customError;
    }
    throw error;
  }
};

const incrementSessionVersion = async (userId) => {
  await pool.query('UPDATE users SET session_version = session_version + 1 WHERE id = ?', [userId]);
};

const getAuditLogs = async (limit) => {
  const safeLimit = Number.isNaN(Number(limit)) ? 50 : Math.min(Number(limit), 200);
  const [rows] = await pool.query(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?',
    [safeLimit]
  );
  return rows;
};

const addAuditLog = async ({ actorUserId, action, details, ip, userAgent }) => {
  const payload = details ? JSON.stringify(details) : null;
  await pool.query(
    'INSERT INTO audit_logs (actor_user_id, action, details, ip, user_agent) VALUES (?, ?, ?, ?, ?)',
    [actorUserId || null, action, payload, ip || null, userAgent || null]
  );
};

const getSettings = async () => {
  const [rows] = await pool.query('SELECT `key`, `value` FROM system_settings');
  const settings = {};
  rows.forEach(row => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });
  return settings;
};

const updateSetting = async (key, value, updatedBy) => {
  await pool.query(
    'UPDATE system_settings SET `value` = ?, updated_by = ?, updated_at = NOW() WHERE `key` = ?',
    [JSON.stringify(value), updatedBy || null, key]
  );
};

const getIpRules = async () => {
  const [rows] = await pool.query('SELECT * FROM ip_rules ORDER BY created_at DESC');
  return rows;
};

const addIpRule = async ({ ip, ruleType, description, createdBy }) => {
  const [result] = await pool.query(
    'INSERT INTO ip_rules (ip, rule_type, description, created_by) VALUES (?, ?, ?, ?)',
    [ip, ruleType, description || null, createdBy || null]
  );
  return result.insertId;
};

const deleteIpRule = async (ruleId) => {
  await pool.query('DELETE FROM ip_rules WHERE id = ?', [ruleId]);
};

const getIpRulesForCheck = async () => {
  const [rows] = await pool.query('SELECT ip, rule_type FROM ip_rules');
  return rows;
};

module.exports = {
  getUsers,
  updateUser,
  incrementSessionVersion,
  getAuditLogs,
  addAuditLog,
  getSettings,
  updateSetting,
  getIpRules,
  addIpRule,
  deleteIpRule,
  getIpRulesForCheck,
};
