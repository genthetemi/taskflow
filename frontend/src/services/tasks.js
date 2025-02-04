import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

//Add token to headers
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fetchTasks = async () => {
    const response = await axios.get(`${API_URL}/api/tasks`);
    return response.data;
};