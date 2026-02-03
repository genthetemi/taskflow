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
    console.error('Error creating board:', error, error.response?.data);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    const serverMsg = error.response?.data?.error || error.message || 'Error creating board';
    // Propagate a meaningful error message to the UI
    throw new Error(serverMsg);
  }
}; 

export const deleteBoard = async (boardId) => {
  try {
    await axios.delete(`${API_URL}/api/boards/${boardId}`, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error('Error deleting board:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const updateBoard = async (boardId, boardData) => {
  try {
    const response = await axios.put(`${API_URL}/api/boards/${boardId}`, boardData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating board:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};