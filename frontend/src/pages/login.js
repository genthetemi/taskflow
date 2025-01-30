import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import { login } from '../services/auth';
import { Form, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = await login(email, password);
        authLogin(token);
        navigate('/dashboard');
    } catch (err) {
        setError('Invalid email or password');
    }
  };

  return (
    <div classsName="container mt-5">
        <h2>Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
            <Form.Group classsName="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group classsName="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </Form.Group>
                <Button variant="primary" type="submit">Login</Button>
            </Form>
        </div>
  );
};