const token = localStorage.getItem('token');

async function loginUser(email, password) {
  const response = await window.apiRequest('/auth/login', 'POST', { email, password });
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
  return response;
}

async function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

window.loginUser = loginUser;
window.logoutUser = logoutUser;
