// API Configuration
// Use relative path for Vercel deployment
const API_BASE_URL = '/api';

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
    
    // Check content type
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text and try to parse
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned invalid response: ${text.substring(0, 100)}`);
      }
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    console.error('Endpoint:', endpoint);
    console.error('Response status:', error.response?.status);
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

// Projects API
const projectsAPI = {
  getAll: async () => {
    return await apiRequest('/projects');
  },

  getOne: async (id) => {
    return await apiRequest(`/projects/${id}`);
  },

  create: async (projectData) => {
    return await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  update: async (id, projectData) => {
    return await apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/projects/${id}`, {
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
  },

  uploadProjectImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/project`, {
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
