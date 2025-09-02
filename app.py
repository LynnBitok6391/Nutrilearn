from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_wtf.csrf import CSRFProtect
from flask_talisman import Talisman
from itsdangerous import URLSafeTimedSerializer
import bcrypt
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your-jwt-secret-key-here'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

# CSRF Protection
app.config['WTF_CSRF_ENABLED'] = True
app.config['WTF_CSRF_SECRET_KEY'] = 'your-csrf-secret-key-here'  # Change this in production

# Initialize extensions
jwt = JWTManager(app)
csrf = CSRFProtect(app)

# Security headers with Talisman
csp = {
    'default-src': "'self'",
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'", "https://unpkg.com"],
    'img-src': ["'self'", "data:"],
    'font-src': ["'self'", "https://unpkg.com"],
}
talisman = Talisman(app, content_security_policy=csp, force_https=False)  # Set force_https=True in production

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production
# Update database URI to MySQL as per tech stack
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:%40Lynn6391@localhost/nutrilearn'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration (for password reset)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your-email@gmail.com'  # Replace with your Gmail
app.config['MAIL_PASSWORD'] = 'your-app-password'  # Use app password from Google account

# Note: The SMTPAuthenticationError indicates invalid email credentials.
# Please update MAIL_USERNAME and MAIL_PASSWORD with valid credentials or disable email sending for testing.

db = SQLAlchemy(app)
mail = Mail(app)
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    dietary_goals = db.Column(db.Text)
    allergies = db.Column(db.Text)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

# Define Quiz model
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    questions = db.Column(db.Text, nullable=False)  # JSON string of questions

# Define Meal model
class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Integer, nullable=False)
    nutrients = db.Column(db.Text)  # JSON string of nutrients
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

# Import routes after app creation
from routes import *

# Removed /index.js route from app.py to avoid conflict with routes.py


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
