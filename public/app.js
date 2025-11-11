const API_BASE = '';

let currentUser = null;

const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginErrorMessage = document.getElementById('loginErrorMessage');
const registerErrorMessage = document.getElementById('registerErrorMessage');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const logoutBtn = document.getElementById('logoutBtn');
const mainNav = document.getElementById('mainNav');
const welcomeMessage = document.getElementById('welcomeMessage');

const tabButtons = document.querySelectorAll('.tab-button');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('[data-tab-content]').forEach(form => {
            form.style.display = 'none';
        });

        document.querySelector(`[data-tab-content="${tab}"]`).style.display = 'block';

        hideLoginError();
        hideRegisterError();
    });
});

function showLoginError(message) {
    loginErrorMessage.textContent = message;
    loginErrorMessage.classList.add('active');
    console.error('Login error:', message);
}

function hideLoginError() {
    loginErrorMessage.textContent = '';
    loginErrorMessage.classList.remove('active');
}

function showRegisterError(message) {
    registerErrorMessage.textContent = message;
    registerErrorMessage.classList.add('active');
    console.error('Register error:', message);
}

function hideRegisterError() {
    registerErrorMessage.textContent = '';
    registerErrorMessage.classList.remove('active');
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    mainNav.style.display = 'flex';

    if (currentUser) {
        welcomeMessage.textContent = `Welcome, ${currentUser.name || currentUser.email}`;
    }
    console.log('Dashboard shown');
}

function showAuth() {
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    mainNav.style.display = 'none';
    currentUser = null;
    console.log('Auth form shown');
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuth();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/app`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
        } else {
            localStorage.removeItem('token');
            showAuth();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        showAuth();
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideLoginError();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        console.log('Login attempt:', email);

        if (!email || !password) {
            showLoginError('Please enter both email and password');
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = 'Signing in...';

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', response.status, data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                currentUser = data.user;
                showDashboard();
            } else {
                showLoginError(data.error || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showLoginError('Connection error. Please check your network and try again.');
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Sign In';
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideRegisterError();

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        console.log('Register attempt:', email);

        if (!name || !email || !password) {
            showRegisterError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            showRegisterError('Password must be at least 6 characters');
            return;
        }

        registerButton.disabled = true;
        registerButton.textContent = 'Creating account...';

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            console.log('Register response:', response.status, data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                currentUser = data.user;
                showDashboard();
            } else {
                showRegisterError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Register error:', error);
            showRegisterError('Connection error. Please check your network and try again.');
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'Create Account';
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        showAuth();
        tabButtons[0].click();
    });
}

checkAuth();
