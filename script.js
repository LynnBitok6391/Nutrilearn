const container = document.querySelector('.container');
const LoginLink = document.querySelector('.SignInLink');
const RegisterLink = document.querySelector('.SignUpLink');
const ForgotPasswordLink = document.querySelector('.ForgotPasswordLink');

if (RegisterLink) {
    RegisterLink.addEventListener('click', () =>{
        container.classList.add('active');
    });
}

if (LoginLink) {
    LoginLink.addEventListener('click', () => {
        container.classList.remove('active');
    });
}

if (ForgotPasswordLink) {
    ForgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'reset-request.html';
    });
}

// Login form handling
const loginForm = document.querySelector('.form-box.Login form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = {
            email: formData.get('email') || this.querySelector('input[type="text"]').value,
            password: formData.get('password') || this.querySelector('input[type="password"]').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userId', result.user_id);
                window.location.href = 'dashboard.html';
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Error logging in');
        }
    });
}

// Register form handling
const registerForm = document.querySelector('.form-box.Register form');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = {
            username: formData.get('username') || this.querySelector('input[type="text"]').value,
            email: formData.get('email') || this.querySelector('input[type="email"]').value,
            password: formData.get('password') || this.querySelector('input[type="password"]').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                alert('Registration successful! Please login.');
                container.classList.remove('active');
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Error registering');
        }
    });
}

// Reset request form handling
const resetRequestForm = document.getElementById('resetRequestForm');
if (resetRequestForm) {
    resetRequestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;

        try {
            const response = await fetch('http://localhost:5000/api/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert('Error sending reset request');
        }
    });
}

// Reset password form handling
const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword })
            });
            const result = await response.json();
            if (response.ok) {
                alert('Password reset successfully! Please login.');
                window.location.href = 'index.html';
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Error resetting password');
        }
    });
}

// Profile form handling
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Profile saved successfully!');
        // Optionally, redirect to dashboard or another page
        window.location.href = 'dashboard.html';
    });
}
