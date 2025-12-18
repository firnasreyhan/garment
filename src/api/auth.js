import api from './axios';
import { getRoleDetail } from './role/role';
import { removeToken, getTokenInfo } from '../utils/tokenManager';

// Fungsi Sign In
export const signIn = (uEmail, uPassword) =>
  api.post('/api/auth/login', { uEmail, uPassword });

// Fungsi Sign Up
export const signUp = ({ uName, uAddress, uEmail, uPhone, uPassword }) =>
  api.post('/api/auth/register', { uName, uAddress, uEmail, uPhone, uPassword });

// Fungsi Logout
export const logout = () => {
  removeToken(); // Remove token from all storage locations
  clearUserPermissions(); // Clear cached permissions
};

// JWT-based User Management Functions
/**
 * Get current user data from JWT token
 * @returns {object|null} Current user data or null if not authenticated
 */
export const getCurrentUser = () => {
  const tokenData = getTokenInfo();
  if (!tokenData) return null;

  return {
    name: tokenData.u_name || tokenData.name,
    email: tokenData.u_email || tokenData.email,
    role: tokenData.u_role || tokenData.role_category || 'USER',
    id: tokenData.u_id || tokenData.id
  };
};

/**
 * Get current user role from JWT token
 * @returns {string} User role (OWNER, ADMIN, TAYLOR, USER)
 */
export const getCurrentUserRole = () => {
  const user = getCurrentUser();
  return user?.role || 'USER';
};

/**
 * Check if current user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} Has role or not
 */
export const hasRole = (role) => {
  return getCurrentUserRole() === role;
};

/**
 * Check if current user has any of specified roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} Has any of the roles
 */
export const hasAnyRole = (roles) => {
  return roles.includes(getCurrentUserRole());
};

export const isAdmin = () => {
  return hasPermission('admin.access');
};

/**
 * Check if current user is customer
 * @returns {boolean} Is customer or not
 */
export const isCustomer = () => {
  return hasRole('USER');
};

export const getUserPermissions = () => {
  // First try to get from localStorage (cached)
  const cachedPermissions = localStorage.getItem('userPermissions');
  if (cachedPermissions) {
    try {
      const permissions = JSON.parse(cachedPermissions);
      return permissions;
    } catch (e) {
      console.error("Failed to parse cached permissions", e);
    }
  }

  // Fallback to tokenData (if backend already includes rAccess)
  const tokenData = getTokenInfo();

  if (!tokenData) return [];

  return tokenData.rAccess || [];
};

/**
 * Fetch user permissions from API and store in localStorage
 * Call this after login or on app mount
 */
export const fetchAndStoreUserPermissions = async () => {
  try {
    const tokenData = getTokenInfo();
    if (!tokenData || !tokenData.r_id) {
      console.log("No token found, cannot fetch permissions");
      return [];
    }

    const response = await getRoleDetail(tokenData.r_id);
    const permissions = response.data?.data?.rAccess || [];


    // Store in localStorage
    localStorage.setItem('userPermissions', JSON.stringify(permissions));

    return permissions;
  } catch (error) {
    console.error("Failed to fetch user permissions:", error);
    return [];
  }
};

/**
 * Clear cached permissions (call on logout)
 */
export const clearUserPermissions = () => {
  localStorage.removeItem('userPermissions');
};

export const hasPermission = (permission) => {
  const permissions = getUserPermissions();

  if (permissions.includes(permission)) {
    return true;
  }

  const [module] = permission.split('.');
  if (permissions.includes(`${module}.*`)) {
    return true;
  }

  return false;
};

export const hasAnyPermission = (requiredPermissions) => {
  return requiredPermissions.some(perm => hasPermission(perm));
};

export const hasAllPermissions = (requiredPermissions) => {
  return requiredPermissions.every(perm => hasPermission(perm));
};