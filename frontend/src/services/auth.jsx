import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, { 
      email, 
      password
    });
    
    const { token, user } = response.data;
    
    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

    // Store token and user immediately after successful login
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    console.error('Login request failed:', error);
    throw error;
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

export const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const register = async ({ firstName, lastName, email, password }) => {
  try {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password
    };
    const response = await axios.post(`${API_URL}/api/auth/register`, payload);
    return response.data;
  } catch (error) {
    console.error('Register request failed:', error, error.response?.data);
    const serverMsg = error.response?.data?.error || error.response?.data?.details || error.message || 'Registration failed';
    throw new Error(serverMsg);
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const headers = getAuthHeader();
    const config = Object.keys(headers).length ? { headers } : {};
    const response = await axios.post(
      `${API_URL}/api/auth/forgot-password`,
      { email },
      config
    );
    return response.data;
  } catch (error) {
    console.error('Forgot password request failed:', error, error.response?.data);
    const serverMsg = error.response?.data?.error || error.message || 'Failed to request password reset';
    throw new Error(serverMsg);
  }
};

export const resetPassword = async ({ email, code, newPassword }) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
      email,
      code,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Reset password request failed:', error, error.response?.data);
    const serverMsg = error.response?.data?.error || error.message || 'Failed to reset password';
    throw new Error(serverMsg);
  }
};


export const checkAuthState = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  console.log('Auth state check:', { hasToken: !!token, hasUser: !!userStr });
  
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      isAuthenticated: !!(token && user),
      user,
      token
    };
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return { isAuthenticated: false, user: null, token: null };
  }
};