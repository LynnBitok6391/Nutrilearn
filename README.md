# Nutrilearn

Nutrilearn is a nutrition and wellness web application that provides personalized meal recommendations, quizzes, and community features to help users achieve their dietary goals.

## Features

- User authentication with secure registration, login, and password reset.
- Responsive and animated authentication pages with form toggling.
- Personalized meal recommendations based on user preferences.
- Interactive quizzes to assess nutrition knowledge.
- User profile management.
- Secure backend APIs with JWT authentication, CSRF protection, and rate limiting.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Flask (Python)
- Database: MySQL
- Authentication: JWT, bcrypt for password hashing
- Email: Flask-Mail for password reset emails
- Security: Flask-Talisman for CSP, CSRF protection

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/LynnBitok6391/Nutrilearn.git
   cd Nutrilearn
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   source .venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure environment variables and update `app.py` with your secret keys and email credentials.

5. Initialize the database:
   ```
   python app.py
   ```

6. Run the Flask app:
   ```
   python app.py
   ```

7. Open your browser and navigate to `http://localhost:5000`.

## Usage

- Register a new account or login with existing credentials.
- Use the meal recommender and quizzes features.
- Manage your profile and preferences.

## License

This project is licensed under the MIT License.
