import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchAdminUsers = async () => {
  const response = await axios.get(`${API_URL}/api/admin/users`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/users/${id}/role`,
    { role },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateUserDetails = async (id, payload) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/users/${id}`,
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/users/${id}/status`,
    { status },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(
    `${API_URL}/api/admin/users/${id}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const revokeSessions = async (id) => {
  const response = await axios.post(
    `${API_URL}/api/admin/users/${id}/revoke-sessions`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const fetchAuditLogs = async () => {
  const response = await axios.get(`${API_URL}/api/admin/audit-logs`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const fetchAdminSettings = async () => {
  const response = await axios.get(`${API_URL}/api/admin/settings`, {
    headers: getAuthHeader() }
  );
  return response.data;
};

export const updateAdminSettings = async (settings) => {
  const response = await axios.put(
    `${API_URL}/api/admin/settings`,
    settings,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const fetchIpRules = async () => {
  const response = await axios.get(`${API_URL}/api/admin/ip-rules`, {
    headers: getAuthHeader() }
  );
  return response.data;
};

export const addIpRule = async (payload) => {
  const response = await axios.post(
    `${API_URL}/api/admin/ip-rules`,
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteIpRule = async (id) => {
  const response = await axios.delete(
    `${API_URL}/api/admin/ip-rules/${id}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};
