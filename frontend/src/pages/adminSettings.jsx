import { useEffect, useState } from 'react';
import { fetchAdminSettings, updateAdminSettings } from '../services/admin';
import { useAuth } from '../context/authContext';

const ADMIN_PROFILE_STORAGE_KEY = 'taskflow.adminProfile';

const loadSavedAdminProfile = () => {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
    if (!raw) {
      return {
        title: 'System Administrator',
        adminEmail: '',
        phone: '',
        team: 'Operations',
        timezone: 'Europe/Belgrade',
        incidentEmail: ''
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      title: 'System Administrator',
      adminEmail: '',
      phone: '',
      team: 'Operations',
      timezone: 'Europe/Belgrade',
      incidentEmail: ''
    };
  }
};

const AdminSettings = () => {
  const { user, login } = useAuth();
  const [settings, setSettings] = useState({
    defaults: { priority: 'Medium', status: 'Pending', dueDays: 7 },
    features: { comments: true, attachments: true, notifications: true },
    maintenance: { enabled: false, message: '' }
  });
  const [profile, setProfile] = useState(loadSavedAdminProfile);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminSettings()
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => setError('Failed to load settings.'));

    if (user?.email || user?.firstName || user?.lastName) {
      setProfile((prev) => ({
        ...prev,
        adminEmail: prev.adminEmail || user.email || '',
        title: prev.title || 'System Administrator'
      }));
    }
  }, [user?.email, user?.firstName, user?.lastName]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setMessage('');
    setError('');

    const primaryEmail = String(profile.adminEmail || '').trim();
    const incidentEmail = String(profile.incidentEmail || '').trim();

    if (!primaryEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(primaryEmail)) {
      setError('Please enter a valid primary admin email.');
      return;
    }

    if (incidentEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(incidentEmail)) {
      setError('Please enter a valid incident alert email.');
      return;
    }

    setSaving(true);

    try {
      const updated = await updateAdminSettings(settings);
      setSettings(prev => ({ ...prev, ...updated }));

      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify({
        ...profile,
        adminEmail: primaryEmail,
        incidentEmail
      }));

      const token = localStorage.getItem('token');
      if (token && user) {
        await login(token, {
          ...user,
          email: primaryEmail
        });
      }

      setMessage('Admin profile and system settings updated.');
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Failed to save admin settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-content container">
      <div className="admin-header">
        <h1>Admin Profile & System Configuration</h1>
        {error && <p className="admin-message admin-message-error">{error}</p>}
        {message && <p className="admin-message">{message}</p>}
      </div>

      <div className="admin-grid">
        <div className="admin-card admin-profile-card">
          <h3>Admin Profile</h3>
          <div className="admin-profile-top">
            <div className="admin-avatar-badge">
              {String(user?.firstName?.[0] || 'A').toUpperCase()}
              {String(user?.lastName?.[0] || '').toUpperCase()}
            </div>
            <div>
              <p className="admin-profile-name mb-1">{user?.firstName || 'Admin'} {user?.lastName || ''}</p>
              <span className="admin-pill admin">{user?.role || 'admin'}</span>
            </div>
          </div>

          <div className="admin-field">
            <label>Title</label>
            <input
              type="text"
              value={profile.title}
              onChange={(event) => handleProfileChange('title', event.target.value)}
              placeholder="System Administrator"
              disabled={saving}
            />
          </div>

          <div className="admin-field">
            <label>Primary admin email</label>
            <input
              type="email"
              value={profile.adminEmail}
              onChange={(event) => handleProfileChange('adminEmail', event.target.value)}
              placeholder="admin@company.com"
              disabled={saving}
            />
          </div>

          <div className="admin-field">
            <label>Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(event) => handleProfileChange('phone', event.target.value)}
              placeholder="+383..."
              disabled={saving}
            />
          </div>

          <div className="admin-field">
            <label>Team</label>
            <select
              value={profile.team}
              onChange={(event) => handleProfileChange('team', event.target.value)}
              disabled={saving}
            >
              <option value="Operations">Operations</option>
              <option value="Security">Security</option>
              <option value="Platform">Platform</option>
              <option value="Product">Product</option>
            </select>
          </div>

          <div className="admin-field">
            <label>Timezone</label>
            <select
              value={profile.timezone}
              onChange={(event) => handleProfileChange('timezone', event.target.value)}
              disabled={saving}
            >
              <option value="Europe/Belgrade">Europe/Belgrade</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>

          <div className="admin-field">
            <label>Incident alert email</label>
            <input
              type="email"
              value={profile.incidentEmail}
              onChange={(event) => handleProfileChange('incidentEmail', event.target.value)}
              placeholder="alerts@company.com"
              disabled={saving}
            />
          </div>
        </div>

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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-dark admin-save" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Profile & Settings'}
      </button>
    </div>
  );
};

export default AdminSettings;
