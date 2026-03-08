// Login Handler
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const authError = document.getElementById('auth-error');

    // Reset all error states
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');
    usernameError.classList.remove('show');
    passwordError.classList.remove('show');
    authError.classList.remove('show');

    let valid = true;

    if (!username) {
        usernameInput.classList.add('error');
        usernameError.classList.add('show');
        valid = false;
    }

    if (!password) {
        passwordInput.classList.add('error');
        passwordError.classList.add('show');
        valid = false;
    }

    if (!valid) return;

    // Check demo credentials
    if (username === 'admin' && password === 'admin123') {
        window.location.href = './pages/home.html';
    } else {
        authError.classList.add('show');
        usernameInput.classList.add('error');
        passwordInput.classList.add('error');
    }
}

// Enter key support
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleLogin();
});

// Sign in
document.getElementById('sign-in-btn').addEventListener('click', handleLogin);