import axios from 'axios';
import { getAuthHeader, handleUnauthorized } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchBoards = async () => {
  try {
    const headers = getAuthHeader();
    console.log('Fetching boards with headers:', headers);
    
    const response = await axios.get(`${API_URL}/api/boards`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching boards:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const createBoard = async (boardData) => {
  try {
    const response = await axios.post(`${API_URL}/api/boards`, boardData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating board:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};