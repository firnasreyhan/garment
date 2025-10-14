// Token Manager Utility
// Handle token storage and retrieval across different domains

/**
 * Save token to multiple storage locations
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
  try {
    // Save to localStorage
    localStorage.setItem('token', token);
    
    // Save to sessionStorage
    sessionStorage.setItem('token', token);
    
    // Save to URL params for ngrok sharing
    const url = new URL(window.location);
    url.searchParams.set('token', token);
    window.history.replaceState({}, '', url);
    
    console.log('Token saved to all storage locations');
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

/**
 * Get token from multiple storage locations
 * @returns {string|null} - JWT token or null
 */
export const getToken = () => {
  try {
    // Try localStorage first
    let token = localStorage.getItem('token');
    
    // If no token in localStorage, try sessionStorage
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    // If still no token, try URL params
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
    }
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove token from all storage locations
 */
export const removeToken = () => {
  try {
    // Remove from localStorage
    localStorage.removeItem('token');
    
    // Remove from sessionStorage
    sessionStorage.removeItem('token');
    
    // Remove from URL params
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url);
    
    console.log('Token removed from all storage locations');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if token exists and is valid
 * @returns {boolean} - True if token exists
 */
export const hasValidToken = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Basic JWT validation (check if it's not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Get token info (decoded payload)
 * @returns {object|null} - Decoded token payload or null
 */
export const getTokenInfo = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
