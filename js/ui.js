document.addEventListener('DOMContentLoaded', function() {
  // Authentication state management
  let currentUser = null;
  let authToken = localStorage.getItem('authToken');

  // Check authentication status on page load
  checkAuthStatus();

  // Form toggle functionality
  const showSignupLink = document.getElementById('showSignup');
  const showLoginLink = document.getElementById('showLogin');
  const loginForm = document.querySelector('.login-form');
  const signupForm = document.querySelector('.signup-form');
  const authInfo = document.querySelector('.auth-info');

  if (showSignupLink && showLoginLink && loginForm && signupForm) {
    showSignupLink.addEventListener('click', function(e) {
      e.preventDefault();
      toggleForms('signup');
    });

    showLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      toggleForms('login');
    });
  }

  function toggleForms(formType) {
    if (formType === 'signup') {
      loginForm.classList.remove('active');
      signupForm.classList.add('active');
      authInfo.innerHTML = `
        <h2>JOIN US!</h2>
        <p>Create your account and start your journey with NutriLearn. We're excited to have you!</p>
      `;
    } else {
      signupForm.classList.remove('active');
      loginForm.classList.add('active');
      authInfo.innerHTML = `
        <h2>WELCOME BACK!</h2>
        <p>We are happy to have you with us again. If you need anything, we are here to help.</p>
      `;
    }
  }

  // Password validation for signup
  const registerPassword = document.getElementById('registerPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const passwordHelperText = document.getElementById('passwordHelperText');

  if (registerPassword && confirmPassword && passwordHelperText) {
    registerPassword.addEventListener('input', validatePasswordStrength);
    confirmPassword.addEventListener('input', validatePasswordConfirmation);
  }

  function validatePasswordStrength() {
    const password = registerPassword.value;
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;

    if (password.length === 0) {
      passwordHelperText.textContent = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.';
      passwordHelperText.className = 'password-helper-text';
    } else if (isValid) {
      passwordHelperText.textContent = '✓ Password meets all requirements!';
      passwordHelperText.className = 'password-helper-text valid';
    } else {
      let requirements = [];
      if (password.length < minLength) requirements.push('8+ characters');
      if (!hasUpperCase) requirements.push('uppercase');
      if (!hasLowerCase) requirements.push('lowercase');
      if (!hasNumbers) requirements.push('number');
      if (!hasSpecialChar) requirements.push('special character');

      passwordHelperText.textContent = `Missing: ${requirements.join(', ')}`;
      passwordHelperText.className = 'password-helper-text invalid';
    }

    validatePasswordConfirmation();
  }

  function validatePasswordConfirmation() {
    const password = registerPassword.value;
    const confirm = confirmPassword.value;

    if (confirm.length > 0) {
      if (password === confirm) {
        confirmPassword.classList.remove('invalid');
        confirmPassword.classList.add('valid');
      } else {
        confirmPassword.classList.remove('valid');
        confirmPassword.classList.add('invalid');
      }
    } else {
      confirmPassword.classList.remove('valid', 'invalid');
    }
  }

  // Login form submission
  const loginFormElement = document.getElementById('loginForm');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
          authToken = data.access_token;
          currentUser = data.user;
          localStorage.setItem('authToken', authToken);
          updateAuthUI();
          alert('Login successful!');
          window.location.href = '/dashboard.html';
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Network error occurred');
      }
    });
  }

  // Logout button (to be added on dashboard page)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      authToken = null;
      currentUser = null;
      localStorage.removeItem('authToken');
      alert('Logged out successfully');
      window.location.href = '/index.html';
    });
  }

  // Update UI based on auth state
  function updateAuthUI() {
    // This can be expanded to update UI elements based on login state
  }
});

// Quiz functionality
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

async function loadQuizData() {
  const quizDiv = document.getElementById('quiz');
  try {
    const response = await makeAuthenticatedRequest('/api/quizzes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    quizData = data.quizzes;

    if (quizData.length > 0) {
      // Load questions for the first quiz
      await loadQuizQuestions(quizData[0].id);
    } else {
      quizDiv.innerHTML = '<p style="color: red; font-weight: bold;">No quizzes available.</p>';
    }
  } catch (error) {
    console.error('Error loading quiz data:', error);
    quizDiv.innerHTML = '<p style="color: red; font-weight: bold;">Failed to load quiz data. Please log in first.</p>';
  }
}

async function loadQuizQuestions(quizId) {
  try {
    const response = await makeAuthenticatedRequest(`/api/quizzes/${quizId}/questions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    quizData = data.questions;
    displayQuestion();
  } catch (error) {
    console.error('Error loading quiz questions:', error);
    const quizDiv = document.getElementById('quiz');
    quizDiv.innerHTML = '<p style="color: red; font-weight: bold;">Failed to load quiz questions.</p>';
  }
}

function displayQuestion() {
  const questionElement = document.getElementById('question');
  const optionsElement = document.getElementById('options');
  const nextBtn = document.getElementById('nextBtn');

  if (currentQuestionIndex < quizData.length) {
    const currentQuestion = quizData[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    optionsElement.innerHTML = '';
    currentQuestion.options.forEach((option, index) => {
      const optionBtn = document.createElement('button');
      optionBtn.className = 'option-btn';
      optionBtn.textContent = option;
      optionBtn.addEventListener('click', () => selectOption(index));
      optionsElement.appendChild(optionBtn);
    });

    nextBtn.style.display = 'none';
  } else {
    showResults();
  }
}

function selectOption(selectedIndex) {
  const options = document.querySelectorAll('.option-btn');
  const nextBtn = document.getElementById('nextBtn');
  const currentQuestion = quizData[currentQuestionIndex];

  userAnswers.push(selectedIndex);

  options.forEach((option, index) => {
    option.disabled = true;
    if (index === currentQuestion.answerIndex) {
      option.classList.add('correct');
    } else if (index === selectedIndex) {
      option.classList.add('incorrect');
    }
  });

  if (selectedIndex === currentQuestion.answerIndex) {
    score++;
  }

  nextBtn.style.display = 'block';
}

function nextQuestion() {
  currentQuestionIndex++;
  displayQuestion();
}

function showResults() {
  const quizDiv = document.getElementById('quiz');
  const resultDiv = document.getElementById('result');
  const scoreElement = document.getElementById('score');
  const restartBtn = document.getElementById('restartBtn');

  quizDiv.style.display = 'none';
  resultDiv.style.display = 'block';

  scoreElement.textContent = `${score} / ${quizData.length}`;

  restartBtn.addEventListener('click', restartQuiz);
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];

  const quizDiv = document.getElementById('quiz');
  const resultDiv = document.getElementById('result');

  quizDiv.style.display = 'block';
  resultDiv.style.display = 'none';

  displayQuestion();
}

// Initialize quiz if on quizzes page
if (document.getElementById('quiz')) {
  loadQuizData();

  document.getElementById('nextBtn').addEventListener('click', nextQuestion);
}

// Settings functionality
if (document.getElementById('profileSettingsForm')) {
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', this.value);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      themeToggle.value = savedTheme;
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      }
    }
  }

  // Font size toggle
  const fontSizeSelect = document.getElementById('fontSize');
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener('change', function() {
      document.body.style.fontSize = this.value === 'small' ? '14px' : this.value === 'large' ? '18px' : '16px';
      localStorage.setItem('fontSize', this.value);
    });

    // Load saved font size
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      fontSizeSelect.value = savedFontSize;
      document.body.style.fontSize = savedFontSize === 'small' ? '14px' : savedFontSize === 'large' ? '18px' : '16px';
    }
  }

  // Notifications toggle
  const notificationsToggle = document.getElementById('notificationsToggle');
  if (notificationsToggle) {
    notificationsToggle.addEventListener('change', function() {
      localStorage.setItem('notifications', this.checked);
      // Here you could add logic to enable/disable notifications
    });

    // Load saved notifications setting
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications !== null) {
      notificationsToggle.checked = savedNotifications === 'true';
    }
  }

  // Privacy toggle
  const dataUsageToggle = document.getElementById('dataUsageToggle');
  if (dataUsageToggle) {
    dataUsageToggle.addEventListener('change', function() {
      localStorage.setItem('dataUsage', this.checked);
      // Here you could add logic to enable/disable data usage
    });

    // Load saved privacy setting
    const savedDataUsage = localStorage.getItem('dataUsage');
    if (savedDataUsage !== null) {
      dataUsageToggle.checked = savedDataUsage === 'true';
    }
  }

  // Profile settings form
  const profileForm = document.getElementById('profileSettingsForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Here you would typically send the data to the server
      alert('Profile settings updated!');
    });
  }

  // Preferences form
  const preferencesForm = document.getElementById('preferencesForm');
  if (preferencesForm) {
    preferencesForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Preferences saved!');
    });
  }

  // Notifications form
  const notificationsForm = document.getElementById('notificationsForm');
  if (notificationsForm) {
    notificationsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Notification settings saved!');
    });
  }

  // Privacy form
  const privacyForm = document.getElementById('privacyForm');
  if (privacyForm) {
    privacyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Privacy settings saved!');
    });
  }
}

// Authentication functions
async function login(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.access_token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      updateAuthUI();
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error occurred' };
  }
}

async function logout() {
  try {
    if (authToken) {
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear local storage and state
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  updateAuthUI();
}

async function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    updateAuthUI();
    return;
  }

  try {
    // Verify token by making a request to a protected endpoint
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      authToken = token;
    } else {
      // Token is invalid, clear it
      localStorage.removeItem('authToken');
      authToken = null;
      currentUser = null;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
  }

  updateAuthUI();
}

function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userInfo = document.getElementById('userInfo');
  const protectedElements = document.querySelectorAll('.protected');

  if (currentUser && authToken) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userInfo) {
      userInfo.style.display = 'block';
      userInfo.textContent = `Welcome, ${currentUser.username}!`;
    }
    protectedElements.forEach(el => el.style.display = 'block');
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    protectedElements.forEach(el => el.style.display = 'none');
  }
}

async function makeAuthenticatedRequest(url, options = {}) {
  if (!authToken) {
    throw new Error('No authentication token available');
  }

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };
  if (options.headers) {
    mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
  }

  const response = await fetch(url, mergedOptions);

  if (response.status === 401) {
    // Token expired or invalid
    logout();
    throw new Error('Authentication required');
  }

  return response;
}

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = await login(email, password);
    if (result.success) {
      alert(result.message);
      // Redirect to dashboard or refresh page
      window.location.href = '/dashboard.html';
    } else {
      alert(result.message);
    }
  });
}

// Handle logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

  // Handle register form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Validate password strength
      if (!validatePasswordStrength(password)) {
        alert('Password does not meet strength requirements. Please ensure it has at least 8 characters, including uppercase, lowercase, numbers, and special characters.');
        return;
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ full_name: fullName, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Registration successful! Please log in.');
          // Switch to login form
          toggleForms('login');
          registerForm.reset();
        } else {
          alert(data.error || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Network error occurred');
      }
    });
  }

// Password strength validation
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// Password confirmation validation
function validatePasswordConfirmation(password, confirmPassword) {
  return password === confirmPassword;
}

// Handle password reset form submission
const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate password strength
    if (!validatePasswordStrength(newPassword)) {
      alert('Password does not meet strength requirements. Please ensure it has at least 8 characters, including uppercase, lowercase, numbers, and special characters.');
      return;
    }

    // Validate password confirmation
    if (!validatePasswordConfirmation(newPassword, confirmPassword)) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      alert('Invalid reset link. Please request a new password reset.');
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successfully! Please log in with your new password.');
        window.location.href = '/index.html';
      } else {
        alert(data.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      alert('Network error occurred');
    }
  });
}

// Handle password reset request form submission
const resetRequestForm = document.getElementById('resetRequestForm');
if (resetRequestForm) {
  resetRequestForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;

    try {
      const response = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('If the email exists, a reset link has been sent. Please check your email.');
        resetRequestForm.reset();
      } else {
        alert(data.error || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      alert('Network error occurred');
    }
  });
}

// Meal recommender functionality
async function loadMeals(preferences = '', calories = null) {
  const mealsContainer = document.getElementById('mealsContainer');
  if (!mealsContainer) return;

  try {
    const params = new URLSearchParams();
    if (preferences) params.append('preferences', preferences);
    if (calories) params.append('calories', calories);

    const url = `/api/meals${params.toString() ? '?' + params.toString() : ''}`;
    const response = await makeAuthenticatedRequest(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayMeals(data.meals);
  } catch (error) {
    console.error('Error loading meals:', error);
    mealsContainer.innerHTML = '<p style="color: red; font-weight: bold;">Failed to load meals. Please log in first.</p>';
  }
}

function displayMeals(meals) {
  const mealsContainer = document.getElementById('mealsContainer');
  if (!mealsContainer) return;

  mealsContainer.innerHTML = '';

  if (meals.length === 0) {
    mealsContainer.innerHTML = '<p>No meals found matching your criteria.</p>';
    return;
  }

  meals.forEach(meal => {
    const mealCard = document.createElement('div');
    mealCard.className = 'meal-card';

    const nutrients = meal.nutrients || {};
    const nutrientsHtml = Object.entries(nutrients)
      .map(([key, value]) => `<span class="nutrient">${key}: ${value}</span>`)
      .join('');

    mealCard.innerHTML = `
      <h3>${meal.name}</h3>
      <p class="calories">${meal.calories} calories</p>
      <p class="description">${meal.description}</p>
      <div class="nutrients">
        ${nutrientsHtml}
      </div>
      <span class="category">${meal.category}</span>
    `;

    mealsContainer.appendChild(mealCard);
  });
}

// Initialize meal recommender if on meal-recommender page
if (document.getElementById('mealsContainer')) {
  // Load initial meals
  loadMeals();

  // Handle filter form
  const mealFilterForm = document.getElementById('mealFilterForm');
  if (mealFilterForm) {
    mealFilterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const preferences = document.getElementById('mealPreferences').value;
      const calories = document.getElementById('mealCalories').value;

      loadMeals(preferences, calories ? parseInt(calories) : null);
    });
  }
}

// Export functions for use in other scripts
window.Auth = {
  login,
  logout,
  checkAuthStatus,
  makeAuthenticatedRequest,
  getCurrentUser: () => currentUser,
  getAuthToken: () => authToken,
  isAuthenticated: () => !!(currentUser && authToken)
};
