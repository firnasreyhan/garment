import api from './axios';
import { removeToken } from '../utils/tokenManager';

// Fungsi Sign In
export const signIn = (uEmail, uPassword) =>
  api.post('/api/auth/login', { uEmail, uPassword });

// Fungsi Sign Up
export const signUp = ({ uName, uAddress, uEmail, uPhone, uPassword }) =>
  api.post('/api/auth/register', { uName, uAddress, uEmail, uPhone, uPassword });

// Fungsi Logout
export const logout = () => {
  removeToken(); // Remove token from all storage locations
  localStorage.removeItem('user');
}; 