import { useEffect, useState } from 'react';
import { fetchAdminSettings, updateAdminSettings } from '../services/admin';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    defaults: { priority: 'Medium', status: 'Pending', dueDays: 7 },
    features: { comments: true, attachments: true, notifications: true },
    maintenance: { enabled: false, message: '' }
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminSettings()
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => setMessage('Failed to load settings.'));
  }, []);

  const handleSave = async () => {
    const updated = await updateAdminSettings(settings);
    setSettings(prev => ({ ...prev, ...updated }));
    setMessage('Settings updated.');
  };

  return (
    <div className="admin-content container">
      <div className="admin-header">
        <h1>System Configuration</h1>
        {message && <p className="admin-message">{message}</p>}
      </div>

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

      <button className="btn btn-dark admin-save" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
};

export default AdminSettings;
