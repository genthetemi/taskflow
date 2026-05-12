import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';
import { useAuth } from '../context/authContext';
import { login } from '../services/auth';
import '../styles/home.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || '';

  const validateEmail = (value) => {
    const cleanValue = String(value || '').trim();
    if (!cleanValue) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanValue)) return 'Enter a valid email address.';
    return '';
  };

  const validatePassword = (value) => {
    const cleanValue = String(value || '');
    if (!cleanValue) return 'Password is required.';
    return '';
  };

  const validateAll = () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password)
    };

    setFieldErrors(nextErrors);
    return Object.values(nextErrors).every((msg) => !msg);
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setFieldErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      const { token, user } = await login(email, password);
      await authLogin(token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
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
                <h1 className="hero-title">Welcome back, <span className="highlight">Sign in</span></h1>
                <p className="hero-subtitle">Sign in to access your workspace and continue managing your tasks.</p>

                <Form onSubmit={handleSubmit} noValidate className="auth-form">
                  <Form.Group className="mb-3" controlId="login-email">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      maxLength={120}
                      isInvalid={Boolean(fieldErrors.email)}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'login-email-error' : 'email-help'}
                      disabled={loading}
                    />
                    {fieldErrors.email ? <div className="auth-inline-error" id="login-email-error">{fieldErrors.email}</div> : null}
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="login-password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      isInvalid={Boolean(fieldErrors.password)}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                      disabled={loading}
                    />
                    {fieldErrors.password ? <div className="auth-inline-error" id="login-password-error">{fieldErrors.password}</div> : null}
                  </Form.Group>

                  <div className="mb-3">
                    <Link to="/forgot-password">Forgot password?</Link>
                  </div>

                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || Object.values(fieldErrors).some(Boolean) || !email.trim() || !password}
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                    <Link to="/register" className="btn btn-outline-secondary">Create account</Link>
                  </div>

                  <div className="mt-3 text-muted small">
                    By signing in you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy</Link>.
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

export default Login;