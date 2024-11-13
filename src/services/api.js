// src/services/api.js
import axios from 'axios';

const API_URL = 'http://192.168.0.79:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

export default api;
