import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return response.data.token;
};

export const register = async (email, password) => {
  await axios.post(`${API_URL}/api/auth/register`, { email, password });
}