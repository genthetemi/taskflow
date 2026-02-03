import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { register as registerService } from '../services/auth';
import '../styles/home.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your first and last name.');
      return false;
    }
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please provide a valid email address.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await registerService({ firstName, lastName, email, password });
      // Redirect to login with a success message
      navigate('/login', { state: { message: 'Registration successful. Please sign in.' } });
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      <section className="hero-section" style={{ paddingTop: '100px' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="auth-card p-4 p-md-5 bg-white rounded shadow-sm">
                <h1 className="hero-title">Create your account — <span className="highlight">Sign up</span></h1>
                <p className="hero-subtitle">Join TaskFlow to start organizing your tasks and collaborate with your team.</p>

                <Form onSubmit={handleSubmit} noValidate className="auth-form">
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <Form.Group controlId="register-firstname">
                        <Form.Label className="small text-muted">First name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-12 col-md-6">
                      <Form.Group controlId="register-lastname">
                        <Form.Label className="small text-muted">Last name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3" controlId="register-email">
                    <Form.Label className="small text-muted">Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-describedby="email-help"
                      disabled={loading}
                    />
                  </Form.Group>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <Form.Group controlId="register-password">
                        <Form.Label className="small text-muted">Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <div className="password-hint small mt-2 text-muted">Password must be 8+ characters.</div>
                      </Form.Group>
                    </div>
                    <div className="col-12 col-md-6">
                      <Form.Group controlId="register-confirm-password">
                        <Form.Label className="small text-muted">Confirm password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <div className="password-match small mt-2" aria-live="polite">
                          {confirmPassword ? (password === confirmPassword ? <span className="text-success">Passwords match</span> : <span className="text-danger">Passwords do not match</span>) : null}
                        </div>
                      </Form.Group>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="d-grid gap-2 mb-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </button>
                  </div>

                  <div className="text-center mb-3">
                    <Link to="/login">Already have an account?</Link>
                  </div>

                  <div className="mt-2 text-muted small text-center">
                    By creating an account you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy</Link>.
                  </div>
                </Form>
              </div>
            </div>

            <div className="col-lg-6 d-none d-lg-block">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dot red"></div>
                  <div className="preview-dot yellow"></div>
                  <div className="preview-dot green"></div>
                </div>
                <div className="preview-content">
                  <div className="preview-task completed">
                    <span>✓ Sync projects instantly</span>
                  </div>
                  <div className="preview-task in-progress">
                    <span>→ Collaborate with your team</span>
                  </div>
                  <div className="preview-task pending">
                    <span>○ Track progress at a glance</span>
                  </div>
                  <div className="preview-task high-priority">
                    <span>⚠️ Stay on top of deadlines</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
