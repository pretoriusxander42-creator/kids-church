const API_BASE = '';

let currentUser = null;

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginButton = document.getElementById('loginButton');
const logoutBtn = document.getElementById('logoutBtn');
const mainNav = document.getElementById('mainNav');
const welcomeMessage = document.getElementById('welcomeMessage');

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('active');
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    mainNav.style.display = 'flex';

    if (currentUser) {
        welcomeMessage.textContent = `Welcome, ${currentUser.name || currentUser.email}`;
    }
}

function showLogin() {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    mainNav.style.display = 'none';
    currentUser = null;
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showLogin();
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
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        showLogin();
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showDashboard();
        } else {
            showError(data.error || 'Invalid credentials. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please check your network and try again.');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    showLogin();
});

checkAuth();
