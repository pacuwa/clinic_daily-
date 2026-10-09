document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('loginForm');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const result = await window.loginUser(email, password);
      alert('Login successful');
      window.location.href = 'dashboard.html';
      console.log(result);
    } catch (error) {
      alert(error.message);
    }
  });
});
