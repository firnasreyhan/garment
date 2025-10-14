import axios from 'axios';
import { getToken } from '../utils/tokenManager';

const api = axios.create({
  baseURL: 'https://api-garment.devtestingapps.my.id',
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

api.interceptors.request.use((config) => {
  // Use token manager to get token from multiple sources
  const token = getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('No token found in request');
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 