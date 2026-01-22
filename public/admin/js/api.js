// API Configuration
// Get API base URL - defaults to localhost:3000 if running locally
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:3000/api'
  : `${window.location.protocol}//${window.location.host}/api`;

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('adminToken');
}

// Set auth token in localStorage
function setAuthToken(token) {
  localStorage.setItem('adminToken', token);
}

// Remove auth token
function removeAuthToken() {
  localStorage.removeItem('adminToken');
}

// API Request helper
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
const authAPI = {
  login: async (username, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setAuthToken(data.token);
    return data;
  },
  
  verify: async () => {
    return await apiRequest('/auth/verify');
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// Team API
const teamAPI = {
  getAll: async () => {
    return await apiRequest('/team');
  },
  
  getOne: async (id) => {
    return await apiRequest(`/team/${id}`);
  },
  
  create: async (teamData) => {
    return await apiRequest('/team', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  },
  
  update: async (id, teamData) => {
    return await apiRequest(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData)
    });
  },
  
  delete: async (id) => {
    return await apiRequest(`/team/${id}`, {
      method: 'DELETE'
    });
  }
};

// Upload API
const uploadAPI = {
  uploadTeamImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/team`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    return await response.json();
  }
};
