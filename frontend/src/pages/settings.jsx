import { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import Navbar from '../components/navbar';
import { useAuth } from '../context/authContext';

const SETTINGS_STORAGE_KEY = 'taskflow.settings';
const USER_PROFILE_STORAGE_KEY = 'taskflow.userProfile';

const loadSavedSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        emailNotifications: true,
        taskReminders: true,
        weeklySummary: false,
        compactView: false
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      emailNotifications: true,
      taskReminders: true,
      weeklySummary: false,
      compactView: false
    };
  }
};

const loadSavedUserProfile = () => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) {
      return {
        jobTitle: '',
        department: '',
        timezone: 'Europe/Belgrade',
        language: 'en',
        bio: ''
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      jobTitle: '',
      department: '',
      timezone: 'Europe/Belgrade',
      language: 'en',
      bio: ''
    };
  }
};

const Settings = () => {
  const { user, login } = useAuth();

  const initialProfile = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    }),
    [user]
  );

  const [profile, setProfile] = useState(initialProfile);
  const [profileDetails, setProfileDetails] = useState(loadSavedUserProfile);
  const [preferences, setPreferences] = useState(loadSavedSettings);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field, checked) => {
    setPreferences((prev) => ({ ...prev, [field]: checked }));
  };

  const handleProfileDetailsChange = (field, value) => {
    setProfileDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    const emailValue = profile.email.trim();
    if (!emailValue || !/^\S+@\S+\.\S+$/.test(emailValue)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSaving(true);

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify({
        jobTitle: profileDetails.jobTitle.trim(),
        department: profileDetails.department.trim(),
        timezone: profileDetails.timezone,
        language: profileDetails.language,
        bio: profileDetails.bio.trim()
      }));

      const token = localStorage.getItem('token');
      if (token && user) {
        await login(token, {
          ...user,
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          email: emailValue
        });
      }

      setSuccess('Settings saved successfully.');
    } catch {
      setError('Unable to save settings right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={9} xl={8}>
            <Card className="shadow-sm border-2">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h1 className="h3 mb-0">My Profile</h1>
                  <small className="text-muted">Manage your account, identity, and preferences</small>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 mb-4 border rounded">
                  <div className="d-inline-flex align-items-center justify-content-center fw-bold rounded-circle bg-dark text-white" style={{ width: 58, height: 58 }}>
                    {initials}
                  </div>
                  <div>
                    <div className="fw-semibold">{profile.firstName || 'User'} {profile.lastName || ''}</div>
                    <small className="text-muted">{profile.email || 'No email set'}</small>
                    <div className="mt-1">
                      <span className="badge text-bg-secondary text-uppercase">{user?.role || 'user'}</span>
                    </div>
                  </div>
                </div>

                {error ? <Alert variant="danger">{error}</Alert> : null}
                {success ? <Alert variant="success">{success}</Alert> : null}

                <Form onSubmit={handleSave}>
                  <h2 className="h5 mb-3">Core Profile</h2>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="settingsFirstName">
                        <Form.Label>First name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.firstName}
                          onChange={(event) => handleProfileChange('firstName', event.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="settingsLastName">
                        <Form.Label>Last name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.lastName}
                          onChange={(event) => handleProfileChange('lastName', event.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="settingsEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={profile.email}
                          onChange={(event) => handleProfileChange('email', event.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h2 className="h5 mb-3">Professional Details</h2>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="settingsJobTitle">
                        <Form.Label>Job title</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileDetails.jobTitle}
                          onChange={(event) => handleProfileDetailsChange('jobTitle', event.target.value)}
                          placeholder="Product Manager"
                          maxLength={80}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="settingsDepartment">
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileDetails.department}
                          onChange={(event) => handleProfileDetailsChange('department', event.target.value)}
                          placeholder="Operations"
                          maxLength={80}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="settingsTimezone">
                        <Form.Label>Timezone</Form.Label>
                        <Form.Select
                          value={profileDetails.timezone}
                          onChange={(event) => handleProfileDetailsChange('timezone', event.target.value)}
                        >
                          <option value="Europe/Belgrade">Europe/Belgrade (GMT+1)</option>
                          <option value="Europe/London">Europe/London (GMT+0)</option>
                          <option value="America/New_York">America/New_York (GMT-5)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="settingsLanguage">
                        <Form.Label>Language</Form.Label>
                        <Form.Select
                          value={profileDetails.language}
                          onChange={(event) => handleProfileDetailsChange('language', event.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="sq">Shqip</option>
                          <option value="de">German</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="settingsBio">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={profileDetails.bio}
                          onChange={(event) => handleProfileDetailsChange('bio', event.target.value)}
                          placeholder="Add a short intro that teammates can see"
                          maxLength={320}
                        />
                        <Form.Text className="text-muted">
                          {profileDetails.bio.length}/320 characters
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h2 className="h5 mb-3">Preferences</h2>
                  <div className="d-grid gap-2">
                    <Form.Check
                      type="switch"
                      id="settingsEmailNotifications"
                      label="Email notifications"
                      checked={preferences.emailNotifications}
                      onChange={(event) => handlePreferenceChange('emailNotifications', event.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id="settingsTaskReminders"
                      label="Task reminders"
                      checked={preferences.taskReminders}
                      onChange={(event) => handlePreferenceChange('taskReminders', event.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id="settingsWeeklySummary"
                      label="Weekly summary email"
                      checked={preferences.weeklySummary}
                      onChange={(event) => handlePreferenceChange('weeklySummary', event.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id="settingsCompactView"
                      label="Compact dashboard view"
                      checked={preferences.compactView}
                      onChange={(event) => handlePreferenceChange('compactView', event.target.checked)}
                    />
                  </div>

                  <hr className="my-4" />

                  <h2 className="h5 mb-3">Security</h2>
                  <Alert variant="light" className="mb-0">
                    Need to change your password? Use the <a href="/forgot-password">password reset flow</a> for secure updates.
                  </Alert>

                  <div className="d-flex justify-content-end mt-4">
                    <Button type="submit" variant="dark" disabled={saving}>
                      {saving ? 'Saving...' : 'Save settings'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Settings;