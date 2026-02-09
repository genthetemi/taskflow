const pool = require('../config/db');

const ensureColumn = async (table, column, definition) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column]
  );

  if (rows[0].count === 0) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
  }
};

const ensureTable = async (createSql) => {
  await pool.query(createSql);
};

const ensureSetting = async (key, value) => {
  const [rows] = await pool.query('SELECT id FROM system_settings WHERE `key` = ?', [key]);
  if (!rows.length) {
    await pool.query(
      'INSERT INTO system_settings (`key`, `value`, updated_at) VALUES (?, ?, NOW())',
      [key, value]
    );
  }
};

const setupDatabase = async () => {
  await ensureColumn('users', 'role', '`role` VARCHAR(20) NOT NULL DEFAULT "user"');
  await ensureColumn('users', 'status', '`status` VARCHAR(20) NOT NULL DEFAULT "active"');
  await ensureColumn('users', 'force_password_reset', '`force_password_reset` TINYINT(1) NOT NULL DEFAULT 0');
  await ensureColumn('users', 'failed_login_count', '`failed_login_count` INT NOT NULL DEFAULT 0');
  await ensureColumn('users', 'lock_until', '`lock_until` DATETIME NULL');
  await ensureColumn('users', 'session_version', '`session_version` INT NOT NULL DEFAULT 0');
  await ensureColumn('users', 'last_login_ip', '`last_login_ip` VARCHAR(45) NULL');
  await ensureColumn('users', 'last_login_at', '`last_login_at` DATETIME NULL');
  await ensureColumn('users', 'last_login_user_agent', '`last_login_user_agent` VARCHAR(255) NULL');

  await ensureTable(
    'CREATE TABLE IF NOT EXISTS audit_logs (\n' +
      'id INT AUTO_INCREMENT PRIMARY KEY,\n' +
      'actor_user_id INT NULL,\n' +
      'action VARCHAR(100) NOT NULL,\n' +
      'details TEXT NULL,\n' +
      'ip VARCHAR(45) NULL,\n' +
      'user_agent VARCHAR(255) NULL,\n' +
      'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n' +
    ')'
  );

  await ensureTable(
    'CREATE TABLE IF NOT EXISTS system_settings (\n' +
      'id INT AUTO_INCREMENT PRIMARY KEY,\n' +
      '`key` VARCHAR(100) NOT NULL UNIQUE,\n' +
      '`value` TEXT NOT NULL,\n' +
      'updated_by INT NULL,\n' +
      'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n' +
    ')'
  );

  await ensureTable(
    'CREATE TABLE IF NOT EXISTS ip_rules (\n' +
      'id INT AUTO_INCREMENT PRIMARY KEY,\n' +
      'ip VARCHAR(45) NOT NULL,\n' +
      'rule_type VARCHAR(10) NOT NULL,\n' +
      'description VARCHAR(255) NULL,\n' +
      'created_by INT NULL,\n' +
      'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n' +
    ')'
  );

  await ensureSetting('defaults', JSON.stringify({
    priority: 'Medium',
    status: 'Pending',
    dueDays: 7
  }));

  await ensureSetting('features', JSON.stringify({
    comments: true,
    attachments: true,
    notifications: true
  }));

  await ensureSetting('maintenance', JSON.stringify({
    enabled: false,
    message: 'System maintenance in progress.'
  }));

  await ensureSetting('security', JSON.stringify({
    lockAfterFailed: 5,
    lockMinutes: 15
  }));
};

module.exports = {
  setupDatabase
};
