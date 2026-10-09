document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setNavigationActive('settings');
    
    if (isAdmin()) {
        document.getElementById('userManagementSection').style.display = 'block';
        loadUsers();
    }
    
    // Change password form
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const current_password = document.getElementById('currentPassword').value;
        const new_password = document.getElementById('newPassword').value;
        const confirm_password = document.getElementById('confirmPassword').value;
        
        if (new_password !== confirm_password) {
            showError('Passwords do not match');
            return;
        }
        
        try {
            await apiRequest('/settings/account/change-password', 'POST', {
                current_password,
                new_password,
                confirm_password
            });
            
            document.getElementById('changePasswordForm').reset();
            showSuccess('Password changed successfully!');
        } catch (error) {
            showError(error.message);
        }
    });
});

async function loadUsers() {
    try {
        const response = await apiRequest('/settings/users');
        const tbody = document.getElementById('usersTableBody');
        
        if (response.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = response.data.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>${user.full_name}</td>
                <td><span class="status-badge status-${user.role.toLowerCase()}">${user.role}</span></td>
                <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="toggleUserStatus(${user.id}, '${user.status}')">Toggle Status</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="6" class="text-center">Error loading users</td></tr>';
    }
}

function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('show');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('show');
    document.getElementById('addUserForm').reset();
}

document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        full_name: document.getElementById('userFullName').value,
        role: document.getElementById('userRole').value
    };
    
    try {
        await apiRequest('/settings/users', 'POST', userData);
        closeAddUserModal();
        loadUsers();
        showSuccess('User added successfully!');
    } catch (error) {
        showError(error.message);
    }
});

async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
        await apiRequest(`/settings/users/${userId}/status`, 'PUT', { status: newStatus });
        loadUsers();
        showSuccess(`User status changed to ${newStatus}`);
    } catch (error) {
        showError(error.message);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

window.toggleUserStatus = toggleUserStatus;
window.showError = showError;
window.showSuccess = showSuccess;
window.openAddUserModal = openAddUserModal;
window.closeAddUserModal = closeAddUserModal;
