import { useEffect, useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import Navbar from '../components/navbar';
import { useAuth } from '../context/authContext';
import '../styles/profile.css';

const USER_PROFILE_STORAGE_KEY = 'taskflow.userProfile';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Failed to read file.'));
  reader.readAsDataURL(file);
});

const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
};

const loadSavedUserProfile = () => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) {
      return {
        jobTitle: '',
        department: '',
        language: 'en',
        bio: '',
        avatar: ''
      };
    }

    return {
      jobTitle: '',
      department: '',
      language: 'en',
      bio: '',
      avatar: '',
      ...JSON.parse(raw)
    };
  } catch {
    return {
      jobTitle: '',
      department: '',
      language: 'en',
      bio: '',
      avatar: ''
    };
  }
};

const UserProfile = () => {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  }));
  const [profileDetails, setProfileDetails] = useState(loadSavedUserProfile);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });

    if (user?.avatar) {
      setProfileDetails((prev) => ({ ...prev, avatar: prev.avatar || user.avatar }));
    }
  }, [user]);

  const initials = getInitials(profile.firstName, profile.lastName);
  const completionTotal = 7;
  const completedFields = [
    profile.firstName.trim(),
    profile.lastName.trim(),
    profile.email.trim(),
    profileDetails.jobTitle.trim(),
    profileDetails.department.trim(),
    profileDetails.bio.trim(),
    profileDetails.avatar
  ].filter(Boolean).length;
  const completionPercent = Math.round((completedFields / completionTotal) * 100);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileDetailsChange = (field, value) => {
    setProfileDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError('');
    setSuccess('');

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
      setProfileDetails((prev) => ({ ...prev, avatar }));
      setSuccess('Profile picture ready to save.');
    } catch {
      setError('Unable to process that image. Please try another file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setProfileDetails((prev) => ({ ...prev, avatar: '' }));
    setSuccess('Profile picture removed. Save profile to keep this change.');
    setError('');
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
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify({
        jobTitle: profileDetails.jobTitle.trim(),
        department: profileDetails.department.trim(),
        language: profileDetails.language,
        bio: profileDetails.bio.trim(),
        avatar: profileDetails.avatar
      }));

      const token = localStorage.getItem('token');
      if (token && user) {
        await login(token, {
          ...user,
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          email: emailValue,
          avatar: profileDetails.avatar
        });
      }

      setSuccess('Profile saved successfully.');
    } catch {
      setError('Unable to save profile right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <Container>
          <div className="profile-shell">
            <section className="profile-hero">
              <div className="profile-hero-main">
                <p className="profile-eyebrow">Personal profile</p>
                <h1 className="profile-title">Make your workspace identity feel complete.</h1>
                <p className="profile-subtitle">
                  This is the version of you the rest of the team sees in boards, comments, and shared work. Keep it clear, current, and easy to recognize.
                </p>
                <div className="profile-chip-row">
                  <span className="profile-chip accent">{user?.role || 'user'} account</span>
                  <span className="profile-chip highlight">{completionPercent}% complete</span>
                  {profileDetails.jobTitle ? <span className="profile-chip">{profileDetails.jobTitle}</span> : null}
                  {profileDetails.department ? <span className="profile-chip">{profileDetails.department}</span> : null}
                </div>
                <div className="profile-metrics">
                  <div className="profile-metric">
                    <span className="profile-metric-label">Profile status</span>
                    <span className="profile-metric-value">{completedFields}/{completionTotal}</span>
                  </div>
                  <div className="profile-metric">
                    <span className="profile-metric-label">Language</span>
                    <span className="profile-metric-value">{profileDetails.language.toUpperCase()}</span>
                  </div>
                  <div className="profile-metric">
                    <span className="profile-metric-label">Photo</span>
                    <span className="profile-metric-value">{profileDetails.avatar ? 'Added' : 'Missing'}</span>
                  </div>
                </div>
              </div>

              <aside className="profile-hero-side">
                <div className="profile-side-header">
                  <div>
                    <p className="profile-eyebrow mb-2">Identity card</p>
                    <h2 className="profile-side-title">{profile.firstName || 'User'} {profile.lastName || ''}</h2>
                  </div>
                  <div className="profile-avatar-frame">
                    {profileDetails.avatar ? (
                      <img src={profileDetails.avatar} alt="Profile" className="profile-avatar-image" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
                <p className="profile-side-copy">Use a recognizable photo and a short bio so teammates can identify you faster in collaborative work.</p>
                <div className="profile-upload-actions">
                  <label htmlFor="profileAvatar" className="profile-upload-trigger">Upload photo</label>
                  <input id="profileAvatar" className="profile-upload-input" type="file" accept="image/*" onChange={handleAvatarUpload} />
                  <button type="button" className="profile-upload-remove" onClick={handleRemoveAvatar} disabled={!profileDetails.avatar || saving}>Remove photo</button>
                </div>
                <p className="profile-side-note">PNG, JPG, or WebP up to 2 MB.</p>
              </aside>
            </section>

            {error ? <Alert className="profile-alert" variant="danger">{error}</Alert> : null}
            {success ? <Alert className="profile-alert" variant="success">{success}</Alert> : null}

            <Form onSubmit={handleSave} className="profile-form-grid">
              <section className="profile-panel">
                <div className="profile-panel-header">
                  <div>
                    <h2 className="profile-panel-title">Core details</h2>
                    <p className="profile-panel-copy">Basic account information used across your workspace.</p>
                  </div>
                  <span className="profile-pill">Public identity</span>
                </div>
                <div className="profile-fields">
                  <Form.Group>
                    <Form.Label className="profile-form-label" htmlFor="profileFirstName">First name</Form.Label>
                    <Form.Control id="profileFirstName" className="profile-input" type="text" value={profile.firstName} onChange={(event) => handleProfileChange('firstName', event.target.value)} required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-form-label" htmlFor="profileLastName">Last name</Form.Label>
                    <Form.Control id="profileLastName" className="profile-input" type="text" value={profile.lastName} onChange={(event) => handleProfileChange('lastName', event.target.value)} required />
                  </Form.Group>
                  <Form.Group className="profile-field-full">
                    <Form.Label className="profile-form-label" htmlFor="profileEmail">Email</Form.Label>
                    <Form.Control id="profileEmail" className="profile-input" type="email" value={profile.email} onChange={(event) => handleProfileChange('email', event.target.value)} required />
                  </Form.Group>
                </div>
              </section>

              <section className="profile-panel">
                <div className="profile-panel-header">
                  <div>
                    <h2 className="profile-panel-title">Work snapshot</h2>
                    <p className="profile-panel-copy">Give context about where you sit and what you do.</p>
                  </div>
                  <span className="profile-pill">Team context</span>
                </div>
                <div className="profile-fields">
                  <Form.Group>
                    <Form.Label className="profile-form-label" htmlFor="profileJobTitle">Job title</Form.Label>
                    <Form.Control id="profileJobTitle" className="profile-input" type="text" value={profileDetails.jobTitle} onChange={(event) => handleProfileDetailsChange('jobTitle', event.target.value)} placeholder="Product Manager" maxLength={80} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-form-label" htmlFor="profileDepartment">Department</Form.Label>
                    <Form.Control id="profileDepartment" className="profile-input" type="text" value={profileDetails.department} onChange={(event) => handleProfileDetailsChange('department', event.target.value)} placeholder="Operations" maxLength={80} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-form-label" htmlFor="profileLanguage">Language</Form.Label>
                    <Form.Select id="profileLanguage" className="profile-select" value={profileDetails.language} onChange={(event) => handleProfileDetailsChange('language', event.target.value)}>
                      <option value="en">English</option>
                      <option value="sq">Shqip</option>
                      <option value="de">German</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </section>

              <section className="profile-panel span-2">
                <div className="profile-panel-header">
                  <div>
                    <h2 className="profile-panel-title">About you</h2>
                    <p className="profile-panel-copy">A short introduction helps collaborators understand your role and communication style.</p>
                  </div>
                  <span className="profile-pill">{profileDetails.bio.length}/320</span>
                </div>
                <div className="profile-fields">
                  <Form.Group className="profile-field-full">
                    <Form.Label className="profile-form-label" htmlFor="profileBio">Short bio</Form.Label>
                    <Form.Control id="profileBio" className="profile-textarea" as="textarea" value={profileDetails.bio} onChange={(event) => handleProfileDetailsChange('bio', event.target.value)} placeholder="Write a short intro, what you focus on, and how teammates can work with you best." maxLength={320} />
                  </Form.Group>
                  <div className="profile-field-full">
                    <div className="profile-bio-card">
                      <p className="profile-bio-caption">Preview</p>
                      <p className="profile-bio-text">{profileDetails.bio.trim() || 'No bio added yet. Add a short intro so your profile feels complete and collaborative.'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="profile-savebar">
                <div>
                  <h3 className="profile-savebar-title">Ready to update your profile?</h3>
                  <p className="profile-savebar-copy">Your photo and details will be used anywhere your identity appears in the app.</p>
                </div>
                <Button className="profile-save-button" variant="dark" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </section>
            </Form>
          </div>
        </Container>
      </div>
    </>
  );
};

export default UserProfile;
