function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../index.html';
        return null;
    }
    return JSON.parse(localStorage.getItem('user'));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

function getUserRole() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.role : null;
}

function isAdmin() {
    return getUserRole() === 'Admin';
}

function setNavigationActive(pageName) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(pageName)) {
            link.classList.add('active');
        }
    });
}

window.checkAuth = checkAuth;
window.logout = logout;
window.getUserRole = getUserRole;
window.isAdmin = isAdmin;
window.setNavigationActive = setNavigationActive;
