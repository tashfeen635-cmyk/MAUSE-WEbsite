// Projects Management JavaScript

let projectsData = [];
let deleteProjectId = null;
let projectModal = null;
let deleteModal = null;
let toast = null;
let loading = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication
  await checkAuth();

  // Load admin info
  loadAdminInfo();

  // Initialize Bootstrap modals and toast
  projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  toast = new bootstrap.Toast(document.getElementById('toast'));

  // Load projects data
  await loadProjectsData();
});

// Check if user is authenticated
async function checkAuth() {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    await authAPI.verify();
  } catch (error) {
    // Token invalid, redirect to login
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminName');
    window.location.href = 'login.html';
  }
}

// Load admin info in the top bar
function loadAdminInfo() {
  const adminName = sessionStorage.getItem('adminName');

  if (adminName) {
    document.getElementById('adminName').innerHTML = `<i class="bi bi-person-circle"></i> ${adminName}`;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('adminName');
  window.location.href = 'login.html';
}

// Load projects data from API
async function loadProjectsData() {
  try {
    loading = true;
    projectsData = await projectsAPI.getAll();
    renderProjectsGrid();
    loading = false;
  } catch (error) {
    loading = false;
    document.getElementById('projectsGrid').innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem;"></i>
        <p class="mt-2 text-danger">Failed to load projects: ${error.message}</p>
        <button class="btn btn-primary mt-2" onclick="loadProjectsData()">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    `;
    showToast('Error', 'Failed to load projects: ' + error.message, 'danger');
    console.error('Load projects error:', error);
  }
}

// Toggle sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.querySelector('.main-content').classList.toggle('expanded');
}

// Render projects grid
function renderProjectsGrid() {
  const grid = document.getElementById('projectsGrid');

  if (projectsData.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-images text-muted" style="font-size: 3rem;"></i>
        <p class="mt-2 text-muted">No projects found. Click "Add New Project" to get started.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  projectsData.forEach((project, index) => {
    const card = createProjectCard(project, index);
    grid.innerHTML += card;
  });
}

// Create project card HTML
function createProjectCard(project, index) {
  // Handle image path - support base64 data URLs and relative paths
  let imagePath = project.image;
  // Base64 data URLs start with 'data:' and don't need modification
  if (!imagePath.startsWith('data:') && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
    // Relative path from assets
    imagePath = imagePath.startsWith('assets/') ? '../' + imagePath : '../assets/img/projects/' + imagePath;
  }

  // Category badge color
  const categoryColors = {
    roadworks: 'primary',
    construction: 'success',
    infrastructure: 'info',
    solar: 'warning',
    other: 'secondary'
  };
  const badgeColor = categoryColors[project.category] || 'secondary';

  // Category display name
  const categoryNames = {
    roadworks: 'Road Works',
    construction: 'Construction',
    infrastructure: 'Infrastructure',
    solar: 'Solar Energy',
    other: 'Other'
  };
  const categoryName = categoryNames[project.category] || 'Other';

  return `
    <div class="col-lg-4 col-md-6">
      <div class="project-card">
        <span class="project-card-order">${index + 1}</span>
        <span class="project-card-category badge bg-${badgeColor}">${categoryName}</span>
        <img src="${imagePath}" alt="${project.title}" class="project-card-image"
             onerror="this.src='../assets/img/projects/project-placeholder.jpg'">
        <div class="project-card-body">
          <h5>${project.title}</h5>
          <p class="description">${truncateText(project.description, 100)}</p>
          <div class="project-card-actions">
            <button class="btn btn-primary btn-sm" onclick="openEditModal('${project._id}')">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${project._id}')">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Truncate text
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Open edit modal
function openEditModal(id) {
  const project = projectsData.find(p => p._id === id);
  if (!project) return;

  document.getElementById('projectId').value = id;
  document.getElementById('projectTitle').value = project.title;
  document.getElementById('projectDescription').value = project.description;
  document.getElementById('projectImage').value = project.image;
  document.getElementById('projectCategory').value = project.category || 'other';
  document.getElementById('projectOrder').value = project.order || 0;

  // Show image preview
  updateProjectImagePreview(project.image);

  document.getElementById('projectModalLabel').textContent = 'Edit Project';
  projectModal.show();
}

// Open add modal
function openAddModal() {
  document.getElementById('projectId').value = '';
  document.getElementById('projectTitle').value = '';
  document.getElementById('projectDescription').value = '';
  document.getElementById('projectImage').value = '';
  document.getElementById('projectCategory').value = 'other';
  document.getElementById('projectOrder').value = projectsData.length; // Default to end of list

  document.getElementById('projectImagePreview').innerHTML = '';
  document.getElementById('projectModalLabel').textContent = 'Add New Project';
  document.getElementById('projectImageUpload').value = ''; // Reset file input
  projectModal.show();
}

// Update image preview
function updateProjectImagePreview(imagePath) {
  const preview = document.getElementById('projectImagePreview');
  if (!imagePath) {
    preview.innerHTML = '';
    return;
  }

  let fullPath = imagePath;

  // Base64 data URLs start with 'data:' and don't need modification
  if (!imagePath.startsWith('data:') && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
    // Relative path from assets
    if (imagePath.startsWith('assets/')) {
      fullPath = '../' + imagePath;
    } else {
      fullPath = '../assets/img/projects/' + imagePath;
    }
  }

  preview.innerHTML = `<img src="${fullPath}" alt="Preview" onerror="this.parentElement.innerHTML='<p class=\\'text-muted\\'>Image not found</p>'">`;
}

// Handle project image upload
async function handleProjectImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Error', 'Please select an image file', 'danger');
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Error', 'Image size must be less than 5MB', 'danger');
    return;
  }

  try {
    // Show loading
    const preview = document.getElementById('projectImagePreview');
    preview.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Uploading...</span></div> Uploading...';

    // Upload to server
    const response = await uploadAPI.uploadProjectImage(file);

    // Update image path
    document.getElementById('projectImage').value = response.path;

    // Show preview
    preview.innerHTML = `<img src="${response.path}" alt="Preview">`;

    showToast('Success', 'Image uploaded successfully!', 'success');
  } catch (error) {
    document.getElementById('projectImagePreview').innerHTML = '<p class="text-danger">Upload failed</p>';
    showToast('Error', 'Failed to upload image: ' + error.message, 'danger');
    console.error('Upload error:', error);
  }
}

// Save project
async function saveProject() {
  const id = document.getElementById('projectId').value;
  const projectData = {
    title: document.getElementById('projectTitle').value.trim(),
    description: document.getElementById('projectDescription').value.trim(),
    image: document.getElementById('projectImage').value.trim(),
    category: document.getElementById('projectCategory').value,
    order: parseInt(document.getElementById('projectOrder').value) || 0
  };

  // Validate
  if (!projectData.title || !projectData.description || !projectData.image) {
    showToast('Error', 'Please fill in all required fields (Title, Description, Image)', 'danger');
    return;
  }

  try {
    if (!id) {
      // Add new project
      await projectsAPI.create(projectData);
      showToast('Success', 'Project added successfully!', 'success');
    } else {
      // Update existing
      await projectsAPI.update(id, projectData);
      showToast('Success', 'Project updated successfully!', 'success');
    }

    projectModal.hide();
    await loadProjectsData(); // Reload projects data
  } catch (error) {
    showToast('Error', 'Failed to save: ' + error.message, 'danger');
    console.error('Save error:', error);
  }
}

// Open delete modal
function openDeleteModal(id) {
  const project = projectsData.find(p => p._id === id);
  if (!project) return;

  deleteProjectId = id;
  document.getElementById('deleteConfirmTitle').textContent = project.title;
  deleteModal.show();
}

// Confirm delete
async function confirmDelete() {
  if (!deleteProjectId) return;

  try {
    await projectsAPI.delete(deleteProjectId);
    deleteModal.hide();
    await loadProjectsData(); // Reload projects data
    showToast('Success', 'Project deleted successfully!', 'success');
    deleteProjectId = null;
  } catch (error) {
    showToast('Error', 'Failed to delete: ' + error.message, 'danger');
    console.error('Delete error:', error);
    deleteProjectId = null;
  }
}

// Export projects data as JSON
function exportProjectsData() {
  const dataStr = JSON.stringify(projectsData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `projects-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Success', 'Projects data exported successfully!', 'success');
}

// Import projects data from JSON
async function importProjectsData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid format - expected an array');
      }

      // Confirm import
      if (!confirm(`Import ${importedData.length} projects? This will add them to your existing projects.`)) {
        return;
      }

      // Import each project
      let successCount = 0;
      let errorCount = 0;

      for (const project of importedData) {
        try {
          const projectData = {
            title: project.title,
            description: project.description,
            image: project.image,
            category: project.category || 'other',
            order: project.order || 0
          };

          if (projectData.title && projectData.description && projectData.image) {
            await projectsAPI.create(projectData);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
          console.error('Import error for project:', project, err);
        }
      }

      await loadProjectsData();
      showToast('Import Complete', `Imported ${successCount} projects. ${errorCount > 0 ? `${errorCount} failed.` : ''}`, successCount > 0 ? 'success' : 'danger');
    } catch (error) {
      showToast('Error', 'Invalid JSON file: ' + error.message, 'danger');
    }
  };
  reader.readAsText(file);

  // Reset file input
  event.target.value = '';
}

// Show toast notification
function showToast(title, message, type) {
  const toastEl = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastBody = document.getElementById('toastBody');
  const toastIcon = document.getElementById('toastIcon');

  toastTitle.textContent = title;
  toastBody.textContent = message;

  // Update icon based on type
  toastIcon.className = 'bi me-2';
  if (type === 'success') {
    toastIcon.classList.add('bi-check-circle', 'text-success');
  } else if (type === 'danger') {
    toastIcon.classList.add('bi-exclamation-circle', 'text-danger');
  } else {
    toastIcon.classList.add('bi-info-circle', 'text-info');
  }

  toast.show();
}

// ============================================
// CHANGE PASSWORD FUNCTIONALITY
// ============================================

let changePasswordModal = null;

// Initialize change password modal
document.addEventListener('DOMContentLoaded', function() {
  const modalEl = document.getElementById('changePasswordModal');
  if (modalEl) {
    changePasswordModal = new bootstrap.Modal(modalEl);
  }
});

// Open change password modal
function openChangePasswordModal() {
  // Reset form
  document.getElementById('changePasswordForm').reset();
  document.getElementById('passwordError').classList.add('d-none');
  document.getElementById('passwordSuccess').classList.add('d-none');

  // Reset password visibility
  ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
    document.getElementById(id).type = 'password';
  });
  ['toggleIcon1', 'toggleIcon2', 'toggleIcon3'].forEach(id => {
    const icon = document.getElementById(id);
    icon.classList.remove('bi-eye-slash');
    icon.classList.add('bi-eye');
  });

  changePasswordModal.show();
}

// Toggle password visibility
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('bi-eye');
    icon.classList.add('bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('bi-eye-slash');
    icon.classList.add('bi-eye');
  }
}

// Change password function
async function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('passwordError');
  const errorText = document.getElementById('passwordErrorText');
  const successDiv = document.getElementById('passwordSuccess');

  // Hide previous messages
  errorDiv.classList.add('d-none');
  successDiv.classList.add('d-none');

  // Validate new password length
  if (newPassword.length < 4) {
    errorText.textContent = 'New password must be at least 4 characters';
    errorDiv.classList.remove('d-none');
    return;
  }

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    errorText.textContent = 'New passwords do not match';
    errorDiv.classList.remove('d-none');
    return;
  }

  // Validate new password is different from current
  if (newPassword === currentPassword) {
    errorText.textContent = 'New password must be different from current password';
    errorDiv.classList.remove('d-none');
    return;
  }

  try {
    // Change password via API
    await authAPI.changePassword(currentPassword, newPassword);

    // Show success message
    successDiv.classList.remove('d-none');

    // Close modal after 2 seconds
    setTimeout(() => {
      changePasswordModal.hide();
      showToast('Success', 'Password changed successfully!', 'success');
      // Reset form
      document.getElementById('changePasswordForm').reset();
    }, 1500);
  } catch (error) {
    errorText.textContent = error.message || 'Failed to change password';
    errorDiv.classList.remove('d-none');
  }
}
