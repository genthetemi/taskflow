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
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await login(email, password);
      await authLogin(token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-describedby="email-help"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="login-password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

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
                      disabled={loading}
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