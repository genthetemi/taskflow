import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { login } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

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
    <div className="login-container">
      <h1>Login</h1>
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group controlId="login-email">
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
          <Form.Text id="email-help" className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="login-password">
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

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </Form>
    </div>
  );
};

export default Login;