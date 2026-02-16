import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { requestPasswordReset, resetPassword } from '../services/auth';
import '../styles/home.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedInEmailLocked, setIsLoggedInEmailLocked] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (token && user?.email) {
        setEmail(String(user.email).trim());
        setIsLoggedInEmailLocked(true);
      }
    } catch (parseError) {
      setIsLoggedInEmailLocked(false);
    }
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await requestPasswordReset(email.trim());
      setSuccess(result?.message || 'If this email exists, a verification code has been sent.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword
      });

      navigate('/login', {
        replace: true,
        state: { message: result?.message || 'Password reset successful. Please sign in.' }
      });
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      <section className="hero-section" style={{ paddingTop: '100px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="auth-card p-4 p-md-5 bg-white rounded shadow-sm">
                <h1 className="hero-title">
                  {step === 1 ? 'Forgot your password?' : 'Reset your password'}
                </h1>
                <p className="hero-subtitle">
                  {step === 1
                    ? 'Enter your email and we will send a verification code.'
                    : 'Enter the verification code from your email and choose a new password.'}
                </p>

                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {step === 1 ? (
                  <Form onSubmit={handleSendCode} noValidate>
                    <Form.Group className="mb-3" controlId="forgot-email">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || isLoggedInEmailLocked}
                      />
                      {isLoggedInEmailLocked && (
                        <Form.Text className="text-muted">
                          Reset email will be sent only to your logged-in account email.
                        </Form.Text>
                      )}
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={loading || !email.trim()}>
                        {loading ? 'Sending code...' : 'Send verification code'}
                      </button>
                      <Link to="/login" className="btn btn-outline-secondary">Back to login</Link>
                    </div>
                  </Form>
                ) : (
                  <Form onSubmit={handleResetPassword} noValidate>
                    <Form.Group className="mb-3" controlId="reset-email">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reset-code">
                      <Form.Label>Verification code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reset-new-password">
                      <Form.Label>New password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reset-confirm-password">
                      <Form.Label>Confirm new password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !email.trim() || code.length !== 6 || !newPassword || !confirmPassword}
                      >
                        {loading ? 'Resetting...' : 'Reset password'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={loading}
                        onClick={() => setStep(1)}
                      >
                        Resend code
                      </button>
                    </div>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
