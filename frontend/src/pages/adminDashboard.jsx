import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import {
  fetchAdminUsers,
  updateUserRole,
  updateUserStatus,
  forcePasswordReset,
  revokeSessions,
  fetchAuditLogs,
  fetchAdminSettings,
  updateAdminSettings,
  fetchIpRules,
  addIpRule,
  deleteIpRule
} from '../services/admin';
import '../styles/admin.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({
    defaults: { priority: 'Medium', status: 'Pending', dueDays: 7 },
    features: { comments: true, attachments: true, notifications: true },
    maintenance: { enabled: false, message: '' },
    security: { lockAfterFailed: 5, lockMinutes: 15 }
  });
  const [ipRules, setIpRules] = useState([]);
  const [newRule, setNewRule] = useState({ ip: '', type: 'allow', description: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [usersData, logsData, settingsData, rulesData] = await Promise.all([
      fetchAdminUsers(),
      fetchAuditLogs(),
      fetchAdminSettings(),
      fetchIpRules()
    ]);

    setUsers(usersData);
    setAuditLogs(logsData);
    setSettings(prev => ({
      ...prev,
      ...settingsData
    }));
    setIpRules(rulesData);
  };

  useEffect(() => {
    loadData().catch(() => {
      setMessage('Failed to load admin data.');
    });
  }, []);

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role);
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, role } : user)));
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    await updateUserStatus(id, nextStatus);
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, status: nextStatus } : user)));
  };

  const handleForceReset = async (id) => {
    await forcePasswordReset(id);
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, force_password_reset: 1 } : user)));
  };

  const handleRevokeSessions = async (id) => {
    await revokeSessions(id);
    setMessage('Sessions revoked for the selected user.');
  };

  const handleSettingsSave = async () => {
    const updated = await updateAdminSettings(settings);
    setSettings(updated);
    setMessage('Settings updated.');
  };

  const handleAddIpRule = async (event) => {
    event.preventDefault();
    if (!newRule.ip.trim()) return;
    await addIpRule(newRule);
    setNewRule({ ip: '', type: 'allow', description: '' });
    const rules = await fetchIpRules();
    setIpRules(rules);
  };

  const handleRemoveIpRule = async (id) => {
    await deleteIpRule(id);
    setIpRules(prev => prev.filter(rule => rule.id !== id));
  };

  return (
    <div className="admin-wrapper">
      <Navbar />
      <div className="admin-content container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          {message && <p className="admin-message">{message}</p>}
        </div>

        <section className="admin-section">
          <h2>User & Access Control</h2>
          <div className="table-responsive">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Security</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const status = user.status || 'active';
                  const role = user.role || 'user';
                  return (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user">
                        <span className="admin-user-name">{user.first_name} {user.last_name}</span>
                        <span className="admin-user-email">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        value={role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        className="form-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${status === 'disabled' ? 'btn-danger' : 'btn-outline-dark'}`}
                        onClick={() => handleStatusToggle(user.id, status)}
                      >
                        {status === 'disabled' ? 'Disabled' : 'Active'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => handleForceReset(user.id)}
                      >
                        Force Reset
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => handleRevokeSessions(user.id)}
                      >
                        Revoke Sessions
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <h2>Security</h2>
          <div className="admin-grid">
            <div className="admin-card">
              <h3>Login Security</h3>
              <div className="admin-field">
                <label>Lock after failed logins</label>
                <input
                  type="number"
                  min="1"
                  value={settings.security.lockAfterFailed}
                  onChange={(event) => setSettings({
                    ...settings,
                    security: { ...settings.security, lockAfterFailed: Number(event.target.value) }
                  })}
                />
              </div>

              <div className="admin-field">
                <label>Lock duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.security.lockMinutes}
                  onChange={(event) => setSettings({
                    ...settings,
                    security: { ...settings.security, lockMinutes: Number(event.target.value) }
                  })}
                />
              </div>
            </div>

            <div className="admin-card">
              <h3>IP Allow / Deny List</h3>
              <form onSubmit={handleAddIpRule} className="admin-inline">
                <input
                  type="text"
                  placeholder="IP address"
                  value={newRule.ip}
                  onChange={(event) => setNewRule({ ...newRule, ip: event.target.value })}
                />
                <select
                  value={newRule.type}
                  onChange={(event) => setNewRule({ ...newRule, type: event.target.value })}
                >
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={newRule.description}
                  onChange={(event) => setNewRule({ ...newRule, description: event.target.value })}
                />
                <button className="btn btn-sm btn-dark" type="submit">Add</button>
              </form>
              <ul className="admin-rule-list">
                {ipRules.map(rule => (
                  <li key={rule.id}>
                    <span>{rule.ip} ({rule.rule_type})</span>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => handleRemoveIpRule(rule.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2>System Configuration</h2>
          <div className="admin-grid">
            <div className="admin-card">
              <h3>Global Defaults</h3>
              <div className="admin-field">
                <label>Default Priority</label>
                <select
                  value={settings.defaults.priority}
                  onChange={(event) => setSettings({
                    ...settings,
                    defaults: { ...settings.defaults, priority: event.target.value }
                  })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Default Status</label>
                <select
                  value={settings.defaults.status}
                  onChange={(event) => setSettings({
                    ...settings,
                    defaults: { ...settings.defaults, status: event.target.value }
                  })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Default Due Days</label>
                <input
                  type="number"
                  min="1"
                  value={settings.defaults.dueDays}
                  onChange={(event) => setSettings({
                    ...settings,
                    defaults: { ...settings.defaults, dueDays: Number(event.target.value) }
                  })}
                />
              </div>
            </div>

            <div className="admin-card">
              <h3>Feature Toggles</h3>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={settings.features.comments}
                  onChange={(event) => setSettings({
                    ...settings,
                    features: { ...settings.features, comments: event.target.checked }
                  })}
                />
                Enable Comments
              </label>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={settings.features.attachments}
                  onChange={(event) => setSettings({
                    ...settings,
                    features: { ...settings.features, attachments: event.target.checked }
                  })}
                />
                Enable Attachments
              </label>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={settings.features.notifications}
                  onChange={(event) => setSettings({
                    ...settings,
                    features: { ...settings.features, notifications: event.target.checked }
                  })}
                />
                Enable Notifications
              </label>
            </div>

            <div className="admin-card">
              <h3>Maintenance Mode</h3>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={settings.maintenance.enabled}
                  onChange={(event) => setSettings({
                    ...settings,
                    maintenance: { ...settings.maintenance, enabled: event.target.checked }
                  })}
                />
                Enable Maintenance Mode
              </label>
              <div className="admin-field">
                <label>Message</label>
                <input
                  type="text"
                  value={settings.maintenance.message}
                  onChange={(event) => setSettings({
                    ...settings,
                    maintenance: { ...settings.maintenance, message: event.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <button className="btn btn-dark admin-save" onClick={handleSettingsSave}>
            Save Settings
          </button>
        </section>

        <section className="admin-section">
          <h2>Audit Log</h2>
          <div className="admin-card">
            <ul className="admin-log-list">
              {auditLogs.map(log => (
                <li key={log.id}>
                  <div>
                    <strong>{log.action}</strong> - {new Date(log.created_at).toLocaleString()}
                  </div>
                  <div className="admin-log-meta">{log.ip || 'Unknown IP'}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
