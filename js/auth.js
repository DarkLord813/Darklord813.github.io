// Admin Authentication
const ADMIN_USERNAME = 'pspgamers';
const ADMIN_PASSWORD = 'admin2025';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const showPasswordBtn = document.getElementById('showPassword');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('loginMessage');
    
    if (showPasswordBtn && passwordInput) {
        showPasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Simple validation
            if (!username || !password) {
                showMessage('Please enter both username and password', 'error');
                return;
            }
            
            // Check credentials
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // Store authentication status in localStorage
                localStorage.setItem('adminAuthenticated', 'true');
                localStorage.setItem('adminUsername', username);
                
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to admin dashboard after 1 second
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                showMessage('Invalid username or password', 'error');
            }
        });
    }
    
    // Check if already logged in
    checkAuth();
});

function checkAuth() {
    // Check if user is on admin page without authentication
    if (window.location.pathname.includes('admin.html')) {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        
        if (!isAuthenticated || isAuthenticated !== 'true') {
            // Redirect to login page
            window.location.href = 'login.html';
        }
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('loginMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUsername');
    window.location.href = 'login.html';
}

// Export logout function for use in other files
window.logout = logout;
