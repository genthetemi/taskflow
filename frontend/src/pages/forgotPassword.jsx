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
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validateEmail = (value) => {
    const cleanValue = String(value || '').trim();
    if (!cleanValue) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanValue)) return 'Enter a valid email address.';
    return '';
  };

  const validateCode = (value) => {
    const cleanValue = String(value || '').trim();
    if (!cleanValue) return 'Verification code is required.';
    if (!/^\d{6}$/.test(cleanValue)) return 'Verification code must be 6 digits.';
    return '';
  };

  const validateNewPassword = (value) => {
    const cleanValue = String(value || '');
    if (!cleanValue) return 'New password is required.';
    if (cleanValue.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const validateConfirmPassword = (newPwd, confirmPwd) => {
    if (!String(confirmPwd || '')) return 'Please confirm your password.';
    if (newPwd !== confirmPwd) return 'Passwords do not match.';
    return '';
  };

  const getPasswordStrength = (value) => {
    const passwordValue = String(value || '');
    if (!passwordValue) {
      return { label: 'Enter a password', score: 0, className: 'is-empty' };
    }

    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    if (score <= 1) return { label: 'Weak', score, className: 'is-weak' };
    if (score <= 2) return { label: 'Fair', score, className: 'is-fair' };
    if (score === 3) return { label: 'Good', score, className: 'is-good' };
    return { label: 'Strong', score, className: 'is-strong' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

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

    const emailError = validateEmail(email);
    setFieldErrors((prev) => ({ ...prev, email: emailError }));
    if (emailError) {
      return;
    }

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

    const nextErrors = {
      email: validateEmail(email),
      code: validateCode(code),
      newPassword: validateNewPassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword)
    };
    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
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
                        onChange={(e) => {
                          const value = e.target.value;
                          setEmail(value);
                          setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
                        }}
                        required
                        isInvalid={Boolean(fieldErrors.email)}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'forgot-email-error' : undefined}
                        disabled={loading || isLoggedInEmailLocked}
                      />
                      {fieldErrors.email ? <div className="auth-inline-error" id="forgot-email-error">{fieldErrors.email}</div> : null}
                      {isLoggedInEmailLocked && (
                        <Form.Text className="text-muted">
                          Reset email will be sent only to your logged-in account email.
                        </Form.Text>
                      )}
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || Boolean(validateEmail(email))}
                      >
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
                        onChange={(e) => {
                          const value = e.target.value;
                          setEmail(value);
                          setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
                        }}
                        required
                        isInvalid={Boolean(fieldErrors.email)}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
                        disabled={loading}
                      />
                      {fieldErrors.email ? <div className="auth-inline-error" id="reset-email-error">{fieldErrors.email}</div> : null}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reset-code">
                      <Form.Label>Verification code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setCode(value);
                          setFieldErrors((prev) => ({ ...prev, code: validateCode(value) }));
                        }}
                        required
                        isInvalid={Boolean(fieldErrors.code)}
                        aria-invalid={Boolean(fieldErrors.code)}
                        aria-describedby={fieldErrors.code ? 'reset-code-error' : undefined}
                        disabled={loading}
                      />
                      {fieldErrors.code ? <div className="auth-inline-error" id="reset-code-error">{fieldErrors.code}</div> : null}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reset-new-password">
                      <Form.Label>New password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewPassword(value);
                          setFieldErrors((prev) => ({
                            ...prev,
                            newPassword: validateNewPassword(value),
                            confirmPassword: validateConfirmPassword(value, confirmPassword)
                          }));
                        }}
                        required
                        isInvalid={Boolean(fieldErrors.newPassword)}
                        aria-invalid={Boolean(fieldErrors.newPassword)}
                        aria-describedby={fieldErrors.newPassword ? 'reset-password-error' : undefined}
                        disabled={loading}
                      />
                      {fieldErrors.newPassword ? <div className="auth-inline-error" id="reset-password-error">{fieldErrors.newPassword}</div> : null}
                      <div className={`password-strength small mt-2 ${passwordStrength.className}`} aria-live="polite">
                        Strength: {passwordStrength.label}
                      </div>
                      <div className="password-strength-bar" aria-hidden="true">
                        <span className={`password-strength-fill ${passwordStrength.className}`} style={{ width: `${Math.min(passwordStrength.score, 4) * 25}%` }}></span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reset-confirm-password">
                      <Form.Label>Confirm new password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setConfirmPassword(value);
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: validateConfirmPassword(newPassword, value)
                          }));
                        }}
                        required
                        isInvalid={Boolean(fieldErrors.confirmPassword)}
                        aria-invalid={Boolean(fieldErrors.confirmPassword)}
                        aria-describedby={fieldErrors.confirmPassword ? 'reset-confirm-password-error' : undefined}
                        disabled={loading}
                      />
                      {fieldErrors.confirmPassword ? <div className="auth-inline-error" id="reset-confirm-password-error">{fieldErrors.confirmPassword}</div> : null}
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          loading ||
                          Object.values(fieldErrors).some(Boolean) ||
                          !email.trim() ||
                          code.length !== 6 ||
                          !newPassword ||
                          !confirmPassword
                        }
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
