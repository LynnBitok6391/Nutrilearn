document.addEventListener('DOMContentLoaded', function() {
  // Tab switching functionality
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const forgotForm = document.getElementById('forgot-form');
  const forgotPasswordLink = document.querySelector('.forgot-password');
  const backToLoginLink = document.getElementById('back-to-login');
  const tabsContainer = document.querySelector('.tabs');

  loginTab.addEventListener('click', () => switchTab('login'));
  signupTab.addEventListener('click', () => switchTab('signup'));
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForgotPasswordForm();
  });
  backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginTab();
  });

  function switchTab(tab) {
    if (tab === 'login') {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
      forgotForm.classList.remove('active');
      forgotForm.setAttribute('tabindex', '-1');
      loginForm.setAttribute('tabindex', '0');
      signupForm.setAttribute('tabindex', '-1');
      tabsContainer.style.display = 'flex';
    } else {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
      forgotForm.classList.remove('active');
      forgotForm.setAttribute('tabindex', '-1');
      signupForm.setAttribute('tabindex', '0');
      loginForm.setAttribute('tabindex', '-1');
      tabsContainer.style.display = 'flex';
    }
  }

  function showForgotPasswordForm() {
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');
    forgotForm.classList.add('active');
    forgotForm.setAttribute('tabindex', '0');
    loginForm.setAttribute('tabindex', '-1');
    signupForm.setAttribute('tabindex', '-1');
    tabsContainer.style.display = 'none';
  }

  function showLoginTab() {
    switchTab('login');
  }

  // Validation functions
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
  }

  function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
  }

  // Login form validation and submission
  const loginFormElement = document.getElementById('login-form');
  loginFormElement.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let isValid = true;

    if (!email) {
      showError('login-email-error', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      showError('login-email-error', 'Please enter a valid email address');
      isValid = false;
    } else {
      clearError('login-email-error');
    }

    if (!password) {
      showError('login-password-error', 'Password is required');
      isValid = false;
    } else {
      clearError('login-password-error');
    }

    if (isValid) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          // Store JWT token in localStorage
          localStorage.setItem('access_token', data.access_token);
          // Redirect to dashboard or protected page
          window.location.href = 'dashboard.html';
        } else {
          // Show error message from backend
          showError('login-password-error', data.error || 'Login failed');
        }
      } catch (error) {
        showError('login-password-error', 'An error occurred. Please try again.');
      }
    }
  });

  // Signup form validation and submission
  const signupFormElement = document.getElementById('signup-form');
  signupFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    const fullname = document.getElementById('signup-fullname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    let isValid = true;

    if (!fullname) {
      showError('signup-fullname-error', 'Full name is required');
      isValid = false;
    } else {
      clearError('signup-fullname-error');
    }

    if (!email) {
      showError('signup-email-error', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      showError('signup-email-error', 'Please enter a valid email address');
      isValid = false;
    } else {
      clearError('signup-email-error');
    }

    if (!password) {
      showError('signup-password-error', 'Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      showError('signup-password-error', 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol');
      isValid = false;
    } else {
      clearError('signup-password-error');
    }

    if (!confirmPassword) {
      showError('signup-confirm-password-error', 'Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      showError('signup-confirm-password-error', 'Passwords do not match');
      isValid = false;
    } else {
      clearError('signup-confirm-password-error');
    }

    if (isValid) {
      console.log('Signup Form Data:', { fullname, email, password });
      alert('Sign up successful! Check console for form data.');
      signupFormElement.reset();
      // Switch to login tab after successful signup
      document.getElementById('login-tab').click();
    }
  });

  // Real-time validation for signup password
  const signupPassword = document.getElementById('signup-password');
  const signupConfirmPassword = document.getElementById('signup-confirm-password');

  signupPassword.addEventListener('input', function() {
    const password = this.value;
    if (password && !validatePassword(password)) {
      showError('signup-password-error', 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol');
    } else {
      clearError('signup-password-error');
    }
  });

  signupConfirmPassword.addEventListener('input', function() {
    const password = signupPassword.value;
    const confirmPassword = this.value;
    if (confirmPassword && password !== confirmPassword) {
      showError('signup-confirm-password-error', 'Passwords do not match');
    } else {
      clearError('signup-confirm-password-error');
    }
  });

  // Clear errors on input
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
      const errorId = this.id + '-error';
      if (document.getElementById(errorId)) {
        clearError(errorId);
      }
    });
  });

  // Forgot password form validation and submission
  const forgotFormElement = document.getElementById('forgot-form');
  forgotFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();

    let isValid = true;

    if (!email) {
      showError('forgot-email-error', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      showError('forgot-email-error', 'Please enter a valid email address');
      isValid = false;
    } else {
      clearError('forgot-email-error');
    }

    if (isValid) {
      console.log('Forgot Password Email:', email);
      alert('Password reset link sent! Check console for email.');
      forgotFormElement.reset();
      showLoginTab();
    }
  });
});
