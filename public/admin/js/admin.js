// Admin Panel JavaScript

let teamData = [];
let deleteIndex = null;
let editModal = null;
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
  editModal = new bootstrap.Modal(document.getElementById('editModal'));
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  toast = new bootstrap.Toast(document.getElementById('toast'));

  // Load team data
  await loadTeamData();
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

// Load team data from API
async function loadTeamData() {
  try {
    loading = true;
    teamData = await teamAPI.getAll();
    renderTeamGrid();
    loading = false;
  } catch (error) {
    loading = false;
    showToast('Error', 'Failed to load team data: ' + error.message, 'danger');
    console.error('Load team data error:', error);
  }
}

// Toggle sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.querySelector('.main-content').classList.toggle('expanded');
}

// Render team members grid
function renderTeamGrid() {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = '';

  teamData.forEach((member, index) => {
    const card = createTeamCard(member, index);
    grid.innerHTML += card;
  });
}

// Create team member card HTML
function createTeamCard(member, index) {
  // Handle image path - if it starts with /uploads, use full URL, otherwise prepend ../
  let imagePath;
  if (member.image.startsWith('/uploads/')) {
    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3000'
      : window.location.origin;
    imagePath = baseUrl + member.image;
  } else if (member.image.startsWith('http')) {
    imagePath = member.image;
  } else if (member.image.startsWith('assets/')) {
    imagePath = '../' + member.image;
  } else {
    imagePath = member.image;
  }

  return `
    <div class="col-lg-4 col-md-6">
      <div class="team-card">
        <span class="team-card-order">${index + 1}</span>
        <img src="${imagePath}" alt="${member.name}" class="team-card-image"
             onerror="this.src='../assets/img/team/team-placeholder.jpg'">
        <div class="team-card-body">
          <h5>${member.name}</h5>
          <p class="position">${member.position}</p>
          <p class="description">${truncateText(member.description, 100)}</p>
          <div class="social-links-preview">
            <a href="${member.social?.twitter || '#'}" target="_blank" class="${member.social?.twitter === '#' || !member.social?.twitter ? 'disabled' : ''}" title="Twitter">
              <i class="bi bi-twitter"></i>
            </a>
            <a href="${member.social?.facebook || '#'}" target="_blank" class="${member.social?.facebook === '#' || !member.social?.facebook ? 'disabled' : ''}" title="Facebook">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="${member.social?.instagram || '#'}" target="_blank" class="${member.social?.instagram === '#' || !member.social?.instagram ? 'disabled' : ''}" title="Instagram">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="${member.social?.linkedin || '#'}" target="_blank" class="${member.social?.linkedin === '#' || !member.social?.linkedin ? 'disabled' : ''}" title="LinkedIn">
              <i class="bi bi-linkedin"></i>
            </a>
          </div>
          <div class="team-card-actions">
            <button class="btn btn-primary btn-sm" onclick="openEditModal('${member._id}')">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${member._id}')">
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
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Open edit modal
function openEditModal(id) {
  const member = teamData.find(m => m._id === id);
  if (!member) return;

  document.getElementById('editIndex').value = id;
  document.getElementById('editName').value = member.name;
  document.getElementById('editPosition').value = member.position;
  document.getElementById('editDescription').value = member.description;
  document.getElementById('editImage').value = member.image;
  document.getElementById('editTwitter').value = member.social?.twitter === '#' || !member.social?.twitter ? '' : member.social.twitter;
  document.getElementById('editFacebook').value = member.social?.facebook === '#' || !member.social?.facebook ? '' : member.social.facebook;
  document.getElementById('editInstagram').value = member.social?.instagram === '#' || !member.social?.instagram ? '' : member.social.instagram;
  document.getElementById('editLinkedin').value = member.social?.linkedin === '#' || !member.social?.linkedin ? '' : member.social.linkedin;

  // Show image preview
  updateImagePreview(member.image);

  document.getElementById('editModalLabel').textContent = 'Edit Team Member';
  editModal.show();
}

// Open add modal
function openAddModal() {
  document.getElementById('editIndex').value = '';
  document.getElementById('editName').value = '';
  document.getElementById('editPosition').value = '';
  document.getElementById('editDescription').value = '';
  document.getElementById('editImage').value = '';
  document.getElementById('editTwitter').value = '';
  document.getElementById('editFacebook').value = '';
  document.getElementById('editInstagram').value = '';
  document.getElementById('editLinkedin').value = '';

  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('editModalLabel').textContent = 'Add New Team Member';
  document.getElementById('imageUpload').value = ''; // Reset file input
  editModal.show();
}

// Update image preview
function updateImagePreview(imagePath) {
  const preview = document.getElementById('imagePreview');
  let fullPath;
  
  if (imagePath.startsWith('/uploads/')) {
    // Server uploaded image
    const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3000'
      : window.location.origin;
    fullPath = baseUrl + imagePath;
  } else if (imagePath.startsWith('http')) {
    fullPath = imagePath;
  } else if (imagePath.startsWith('assets/')) {
    fullPath = '../' + imagePath;
  } else {
    fullPath = imagePath;
  }
  
  preview.innerHTML = `<img src="${fullPath}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;" onerror="this.parentElement.innerHTML='<p class=\\'text-muted\\'>Image not found</p>'">`;
}

// Handle image upload
async function handleImageUpload(event) {
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
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Uploading...</span></div>';

    // Upload to server
    const response = await uploadAPI.uploadTeamImage(file);
    
    // Update image path
    document.getElementById('editImage').value = response.path;
    
    // Show preview
    preview.innerHTML = `<img src="${response.path}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
    
    showToast('Success', 'Image uploaded successfully!', 'success');
  } catch (error) {
    document.getElementById('imagePreview').innerHTML = '<p class="text-danger">Upload failed</p>';
    showToast('Error', 'Failed to upload image: ' + error.message, 'danger');
    console.error('Upload error:', error);
  }
}

// Save edit
async function saveEdit() {
  const id = document.getElementById('editIndex').value;
  const memberData = {
    name: document.getElementById('editName').value.trim(),
    position: document.getElementById('editPosition').value.trim(),
    description: document.getElementById('editDescription').value.trim(),
    image: document.getElementById('editImage').value.trim(),
    social: {
      twitter: document.getElementById('editTwitter').value.trim() || '#',
      facebook: document.getElementById('editFacebook').value.trim() || '#',
      instagram: document.getElementById('editInstagram').value.trim() || '#',
      linkedin: document.getElementById('editLinkedin').value.trim() || '#'
    }
  };

  // Validate
  if (!memberData.name || !memberData.position || !memberData.description || !memberData.image) {
    showToast('Error', 'Please fill in all required fields', 'danger');
    return;
  }

  try {
    if (!id) {
      // Add new member
      await teamAPI.create(memberData);
      showToast('Success', 'Team member added successfully!', 'success');
    } else {
      // Update existing
      await teamAPI.update(id, memberData);
      showToast('Success', 'Team member updated successfully!', 'success');
    }

    editModal.hide();
    await loadTeamData(); // Reload team data
  } catch (error) {
    showToast('Error', 'Failed to save: ' + error.message, 'danger');
    console.error('Save error:', error);
  }
}

// Open delete modal
function openDeleteModal(id) {
  const member = teamData.find(m => m._id === id);
  if (!member) return;
  
  deleteIndex = id;
  document.getElementById('deleteConfirmName').textContent = member.name;
  deleteModal.show();
}

// Confirm delete
async function confirmDelete() {
  if (!deleteIndex) return;

  try {
    await teamAPI.delete(deleteIndex);
    deleteModal.hide();
    await loadTeamData(); // Reload team data
    showToast('Success', 'Team member deleted successfully!', 'success');
    deleteIndex = null;
  } catch (error) {
    showToast('Error', 'Failed to delete: ' + error.message, 'danger');
    console.error('Delete error:', error);
    deleteIndex = null;
  }
}

// Save all changes (already saved individually, just show message)
function saveAllChanges() {
  showToast('Success', 'All changes are automatically saved to the database!', 'success');
}

// Reset to default (Not implemented - use with caution)
async function resetToDefault() {
  if (confirm('Are you sure you want to delete all team members? This cannot be undone. You will need to add them back manually.')) {
    try {
      // Delete all team members
      for (const member of teamData) {
        await teamAPI.delete(member._id);
      }
      await loadTeamData();
      showToast('Success', 'All team members deleted!', 'success');
    } catch (error) {
      showToast('Error', 'Failed to reset: ' + error.message, 'danger');
      console.error('Reset error:', error);
    }
  }
}

// Generate HTML for team section
function generateTeamHTML() {
  let html = '<!-- Generated Team Section HTML -->\n';
  html += '<div class="row gy-5">\n';

  teamData.forEach((member, index) => {
    const delay = (index + 1) * 100;
    const specialStyle = index === 1 ? ' style="margin-bottom: 42px;"' : '';
    const imgStyle = index === 1 ? 'style="border-radius: 100%;" ' : '';

    html += `
          <div class="col-lg-4 col-md-6 member" data-aos="fade-up" data-aos-delay="${delay}">
            <div class="member-img"${specialStyle}>
              <img ${imgStyle}src="${member.image}" class="img-fluid" alt="">
              <div class="social">
                <a href="${member.social.twitter}"><i class="bi bi-twitter"></i></a>
                <a href="${member.social.facebook}"><i class="bi bi-facebook"></i></a>
                <a href="${member.social.instagram}"><i class="bi bi-instagram"></i></a>
                <a href="${member.social.linkedin}"><i class="bi bi-linkedin"></i></a>
              </div>
            </div>
            <div class="member-info text-center">
              <h4>${member.name}</h4>
              <span>${member.position}</span>
              <p>${member.description}</p>
            </div>
          </div><!-- End Team Member -->
`;
  });

  html += '</div>\n';

  console.log('Generated HTML:');
  console.log(html);
}

// Export data as JSON
function exportData() {
  const dataStr = JSON.stringify(teamData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `team-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Success', 'Team data exported successfully!', 'success');
}

// Import data from JSON
function importData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          teamData = importedData;
          renderTeamGrid();
          showToast('Success', 'Team data imported successfully!', 'success');
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        showToast('Error', 'Invalid JSON file. Please check the format.', 'danger');
      }
    };
    reader.readAsText(file);
  }
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
