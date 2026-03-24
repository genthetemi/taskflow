import axios from 'axios';
import { getAuthHeader, handleUnauthorized } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchTasks = async (boardId, options = {}) => {
  try {
    if (!boardId) {
      console.log('No board ID provided');
      return [];
    }

    const params = { board_id: boardId };
    if (options.query) {
      params.q = options.query;
    }
    
    console.log('Fetching tasks for board:', boardId);
    const response = await axios.get(`${API_URL}/api/tasks`, {
      params,
      headers: getAuthHeader()
    });
    
    console.log('Tasks received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Task fetch error:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/api/tasks`, taskData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axios.put(`${API_URL}/api/tasks/${taskId}`, taskData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const fetchTaskComments = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/api/tasks/${taskId}/comments`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching task comments:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};

export const createTaskComment = async (taskId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/tasks/${taskId}/comments`,
      { message },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating task comment:', error);
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    throw error;
  }
};