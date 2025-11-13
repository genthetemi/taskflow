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
    console.error('No auth token found');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

export const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
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