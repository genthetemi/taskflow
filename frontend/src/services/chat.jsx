import axios from 'axios';
import { getAuthHeader, handleUnauthorized } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchBoardChatMessages = async (boardId) => {
  try {
    const response = await axios.get(`${API_URL}/api/chat/boards/${boardId}/messages`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const createBoardChatMessage = async (boardId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/chat/boards/${boardId}/messages`,
      { message },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};