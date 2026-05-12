import { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import '../styles/admin.css';
import '../styles/profile.css';

const ADMIN_PROFILE_STORAGE_KEY = 'taskflow.adminProfile';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Failed to read file.'));
  reader.readAsDataURL(file);
});

const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'A';
};

const loadSavedAdminProfile = () => {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
    if (!raw) {
      return {
        title: 'System Administrator',
        adminEmail: '',
        phone: '',
        incidentEmail: '',
        avatar: ''
      };
    }

    return {
      title: 'System Administrator',
      adminEmail: '',
      phone: '',
      incidentEmail: '',
      avatar: '',
      ...JSON.parse(raw)
    };
  } catch {
    return {
      title: 'System Administrator',
      adminEmail: '',
      phone: '',
      incidentEmail: '',
      avatar: ''
    };
  }
};

const AdminProfile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(loadSavedAdminProfile);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const completionTotal = 6;
  const completedFields = [
    profile.title.trim(),
    profile.adminEmail.trim(),
    profile.phone.trim(),
    profile.incidentEmail.trim(),
    profile.avatar,
    user?.firstName || user?.lastName
  ].filter(Boolean).length;
  const completionPercent = Math.round((completedFields / completionTotal) * 100);

  useEffect(() => {
    if (user?.email || user?.firstName || user?.lastName) {
      setProfile((prev) => ({
        ...prev,
        adminEmail: prev.adminEmail || user.email || '',
        title: prev.title || 'System Administrator',
        avatar: prev.avatar || user?.avatar || ''
      }));
    }
  }, [user?.email, user?.firstName, user?.lastName, user?.avatar]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError('');
    setMessage('');

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError('Profile picture must be smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    try {
      const avatar = await fileToDataUrl(file);
      setProfile((prev) => ({ ...prev, avatar }));
      setMessage('Profile picture ready to save.');
    } catch {
      setError('Unable to process that image. Please try another file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setProfile((prev) => ({ ...prev, avatar: '' }));
    setMessage('Profile picture removed. Save profile to keep this change.');
    setError('');
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
      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify({
        ...profile,
        adminEmail: primaryEmail,
        incidentEmail
      }));

      const token = localStorage.getItem('token');
      if (token && user) {
        await login(token, {
          ...user,
          email: primaryEmail,
          avatar: profile.avatar
        });
      }

      setMessage('Admin profile updated successfully.');
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Failed to save admin profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-content container">
      <div className="profile-shell">
        <section className="profile-hero">
          <div className="profile-hero-main">
            <p className="profile-eyebrow">Admin profile</p>
            <h1 className="profile-title">Build a profile that feels credible and operational.</h1>
            <p className="profile-subtitle">
              Your admin identity should look deliberate. Keep a clear photo, accurate contact details, and the right alert address for incident-driven workflows.
            </p>
            <div className="profile-chip-row">
              <span className="profile-chip accent">{user?.role || 'admin'} workspace</span>
              <span className="profile-chip highlight">{completionPercent}% complete</span>
              {profile.title ? <span className="profile-chip">{profile.title}</span> : null}
            </div>
            <div className="profile-metrics">
              <div className="profile-metric">
                <span className="profile-metric-label">Profile status</span>
                <span className="profile-metric-value">{completedFields}/{completionTotal}</span>
              </div>
              <div className="profile-metric">
                <span className="profile-metric-label">Photo</span>
                <span className="profile-metric-value">{profile.avatar ? 'Active' : 'Missing'}</span>
              </div>
              <div className="profile-metric">
                <span className="profile-metric-label">Alerts</span>
                <span className="profile-metric-value">{profile.incidentEmail ? 'Ready' : 'Pending'}</span>
              </div>
            </div>
          </div>

          <aside className="profile-hero-side">
            <div className="profile-side-header">
              <div>
                <p className="profile-eyebrow mb-2">Admin identity</p>
                <h2 className="profile-side-title">{user?.firstName || 'Admin'} {user?.lastName || ''}</h2>
              </div>
              <div className="profile-avatar-frame">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Admin profile" className="profile-avatar-image" />
                ) : (
                  getInitials(user?.firstName, user?.lastName)
                )}
              </div>
            </div>
            <p className="profile-side-copy">A strong admin profile gives the control area a real operator behind it instead of a generic account shell.</p>
            <div className="profile-upload-actions">
              <label htmlFor="adminProfileAvatar" className="profile-upload-trigger">Upload photo</label>
              <input id="adminProfileAvatar" className="profile-upload-input" type="file" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
              <button type="button" className="profile-upload-remove" onClick={handleRemoveAvatar} disabled={!profile.avatar || saving}>Remove photo</button>
            </div>
            <p className="profile-side-note">Keep it professional. PNG, JPG, or WebP up to 2 MB.</p>
          </aside>
        </section>

        {error ? <Alert className="profile-alert" variant="danger">{error}</Alert> : null}
        {message ? <Alert className="profile-alert" variant="success">{message}</Alert> : null}

        <Form className="profile-form-grid" onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}>
          <section className="profile-panel">
            <div className="profile-panel-header">
              <div>
                <h2 className="profile-panel-title">Admin identity</h2>
                <p className="profile-panel-copy">Core details used to represent the administrator across the platform.</p>
              </div>
              <span className="profile-pill">Operator</span>
            </div>

            <div className="profile-fields">
              <Form.Group>
                <Form.Label className="profile-form-label" htmlFor="adminTitle">Title</Form.Label>
                <Form.Control id="adminTitle" className="profile-input" type="text" value={profile.title} onChange={(event) => handleProfileChange('title', event.target.value)} placeholder="System Administrator" disabled={saving} />
              </Form.Group>
              <Form.Group>
                <Form.Label className="profile-form-label" htmlFor="adminPhone">Phone</Form.Label>
                <Form.Control id="adminPhone" className="profile-input" type="text" value={profile.phone} onChange={(event) => handleProfileChange('phone', event.target.value)} placeholder="+383..." disabled={saving} />
              </Form.Group>
              <Form.Group className="profile-field-full">
                <Form.Label className="profile-form-label" htmlFor="adminPrimaryEmail">Primary admin email</Form.Label>
                <Form.Control id="adminPrimaryEmail" className="profile-input" type="email" value={profile.adminEmail} onChange={(event) => handleProfileChange('adminEmail', event.target.value)} placeholder="admin@company.com" disabled={saving} />
              </Form.Group>
            </div>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-header">
              <div>
                <h2 className="profile-panel-title">Operational contact</h2>
                <p className="profile-panel-copy">Incident workflows need a clear escalation address that stays current.</p>
              </div>
              <span className="profile-pill">Alerts</span>
            </div>

            <div className="profile-fields">
              <Form.Group className="profile-field-full">
                <Form.Label className="profile-form-label" htmlFor="adminIncidentEmail">Incident alert email</Form.Label>
                <Form.Control id="adminIncidentEmail" className="profile-input" type="email" value={profile.incidentEmail} onChange={(event) => handleProfileChange('incidentEmail', event.target.value)} placeholder="alerts@company.com" disabled={saving} />
              </Form.Group>
              <div className="profile-field-full">
                <div className="profile-bio-card">
                  <p className="profile-bio-caption">Admin note</p>
                  <p className="profile-bio-text">Use a monitored address here so system notifications and incident traffic land with the right person immediately.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-savebar">
            <div>
              <h3 className="profile-savebar-title">Save your admin identity</h3>
              <p className="profile-savebar-copy">This keeps the control area looking consistent and makes alert ownership explicit.</p>
            </div>
            <Button className="profile-save-button" variant="dark" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </section>
        </Form>
      </div>
    </div>
  );
};

export default AdminProfile;
