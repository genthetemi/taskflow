import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchPublishedFaqs = async () => {
  const response = await axios.get(`${API_URL}/api/faq`);
  return response.data;
};

export const submitFaqQuestion = async (question) => {
  const response = await axios.post(
    `${API_URL}/api/faq/questions`,
    { question },
    { headers: getAuthHeader() }
  );
  return response.data;
};
