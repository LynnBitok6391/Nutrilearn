from flask import request, jsonify, send_file
from app import app, db, mail, serializer, User, Quiz, Meal, jwt, create_access_token, jwt_required, get_jwt_identity, csrf
import json
from flask_mail import Message
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, EmailField, validators
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import re
import logging

# Setup rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
limiter.init_app(app)

# Setup audit logger
audit_logger = logging.getLogger('audit')
audit_logger.setLevel(logging.INFO)
if not audit_logger.hasHandlers():
    handler = logging.FileHandler('audit.log')
    formatter = logging.Formatter('%(asctime)s - %(message)s')
    handler.setFormatter(formatter)
    audit_logger.addHandler(handler)

def is_password_strong(password):
    # Password strength: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True

@app.route('/api/register', methods=['POST'])
@csrf.exempt
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        audit_logger.info(f"Registration attempt failed - email already registered: {email}")
        return jsonify({'error': 'Email already registered'}), 400

    if not is_password_strong(password):
        audit_logger.info(f"Registration attempt failed - weak password for email: {email}")
        return jsonify({'error': 'Password does not meet strength requirements'}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    audit_logger.info(f"User registered successfully: {email}")
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
@csrf.exempt
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Input validation and sanitization
    if not email or not password:
        audit_logger.info(f"Login attempt failed - missing credentials from IP: {request.remote_addr}")
        return jsonify({'error': 'Email and password are required'}), 400

    # Sanitize email
    email = email.strip().lower()
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        audit_logger.info(f"Login attempt failed - invalid email format: {email} from IP: {request.remote_addr}")
        return jsonify({'error': 'Invalid email format'}), 400

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        # Create JWT token
        access_token = create_access_token(identity=str(user.id))
        audit_logger.info(f"Login successful for user: {email} from IP: {request.remote_addr}")
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    audit_logger.info(f"Login attempt failed - invalid credentials for email: {email} from IP: {request.remote_addr}")
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/request-password-reset', methods=['POST'])
@csrf.exempt
def request_password_reset():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200

    token = serializer.dumps(email, salt='password-reset-salt')
    reset_url = f"http://localhost:5000/reset-password?token={token}"

    # Mock email sending for testing
    print(f"[MOCK EMAIL] To: {email}")
    print(f"[MOCK EMAIL] Subject: Password Reset Request")
    print(f"[MOCK EMAIL] Body: Click the link to reset your password: {reset_url}")

    # Comment out actual email sending
    # msg = Message('Password Reset Request', sender='your-email@gmail.com', recipients=[email])
    # msg.body = f'Click the link to reset your password: {reset_url}'
    # mail.send(msg)

    return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200

@app.route('/api/reset-password', methods=['POST'])
@csrf.exempt
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)  # 1 hour
    except:
        return jsonify({'error': 'Invalid or expired token'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password reset successfully'}), 200

from ai import generate_response

@app.route('/api/chatbot', methods=['POST'])
@csrf.exempt
@jwt_required()
def chatbot():
    data = request.get_json()
    prompt = data.get('prompt', '')

    # Input validation and sanitization
    if not prompt or not isinstance(prompt, str):
        return jsonify({'error': 'Valid prompt is required'}), 400

    # Sanitize prompt (remove potentially harmful characters)
    prompt = re.sub(r'[<>]', '', prompt.strip())
    if len(prompt) > 1000:  # Limit prompt length
        return jsonify({'error': 'Prompt too long'}), 400

    try:
        response = generate_response(prompt)
        return jsonify({'response': response})
    except Exception as e:
        app.logger.error(f"Chatbot error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Routes to serve frontend files
@app.route('/')
def index():
    return send_file('index.html')

@ app.route('/style.css')
def style():
    css_path = os.path.join(os.getcwd(), 'css', 'style.css')
    if os.path.exists(css_path):
        return send_file(css_path)
    else:
        return '', 404

@app.route('/script.js')
def script():
    js_path = os.path.join(os.getcwd(), 'js', 'ui.js')
    if os.path.exists(js_path):
        return send_file(js_path)
    else:
        return '', 404

# Removed duplicate /index.js route from routes.py to avoid conflict with app.py


@app.route('/js/<path:filename>')
def serve_js(filename):
    js_path = os.path.join(os.getcwd(), 'js', filename)
    if os.path.exists(js_path):
        return send_file(js_path)
    else:
        return '', 404

import os

@app.route('/favicon.ico')
def favicon():
    favicon_path = os.path.join(os.getcwd(), 'favicon.ico')
    if os.path.exists(favicon_path):
        return send_file(favicon_path)
    else:
        # Return 404 or a default empty response if favicon not found
        return '', 404

@app.route('/<page>.html')
def page(page):
    return send_file(page + '.html')

# Protected routes for quizzes and profile
@app.route('/api/quizzes', methods=['GET'])
@csrf.exempt
@jwt_required()
def get_quizzes():
    """Get available quizzes for authenticated user"""
    try:
        quizzes = Quiz.query.all()
        quiz_list = []
        for quiz in quizzes:
            quiz_list.append({
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description
            })
        return jsonify({'quizzes': quiz_list})
    except Exception as e:
        app.logger.error(f"Error fetching quizzes: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/quizzes/<int:quiz_id>/questions', methods=['GET'])
@csrf.exempt
@jwt_required()
def get_quiz_questions(quiz_id):
    """Get questions for a specific quiz"""
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404

        questions = json.loads(quiz.questions)
        return jsonify({'questions': questions})
    except Exception as e:
        app.logger.error(f"Error fetching quiz questions: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/meals', methods=['GET'])
@csrf.exempt
@jwt_required()
def get_meals():
    """Get available meals for authenticated user"""
    try:
        preferences = request.args.get('preferences', '').lower()
        calories = request.args.get('calories', type=int)

        query = Meal.query

        # Filter by preferences if provided
        if preferences:
            if 'vegetarian' in preferences:
                query = query.filter(Meal.category.in_(['vegetarian', 'vegan', 'salad']))
            elif 'vegan' in preferences:
                query = query.filter(Meal.category == 'vegan')
            elif 'low-carb' in preferences:
                query = query.filter(Meal.category == 'low-carb')
            elif 'high-protein' in preferences:
                query = query.filter(Meal.category == 'high-protein')

        # Filter by calories if provided
        if calories:
            if 'weight-loss' in preferences or calories < 500:
                query = query.filter(Meal.calories <= calories)
            else:
                query = query.filter(Meal.calories <= calories + 200)

        meals = query.limit(10).all()
        meal_list = []
        for meal in meals:
            nutrients = json.loads(meal.nutrients) if meal.nutrients else {}
            meal_list.append({
                'id': meal.id,
                'name': meal.name,
                'calories': meal.calories,
                'nutrients': nutrients,
                'category': meal.category,
                'description': meal.description
            })

        return jsonify({'meals': meal_list})
    except Exception as e:
        app.logger.error(f"Error fetching meals: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/profile', methods=['GET'])
@csrf.exempt
@jwt_required()
def get_profile():
    """Get user profile information"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'age': user.age,
                'weight': user.weight,
                'dietary_goals': user.dietary_goals,
                'allergies': user.allergies
            }
        })
    except Exception as e:
        app.logger.error(f"Error fetching profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/profile', methods=['PUT'])
@csrf.exempt
@jwt_required()
def update_profile():
    """Update user profile information"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        # Update allowed fields with validation
        if 'age' in data:
            if not isinstance(data['age'], int) or data['age'] < 0 or data['age'] > 150:
                return jsonify({'error': 'Invalid age'}), 400
            user.age = data['age']

        if 'weight' in data:
            if not isinstance(data['weight'], (int, float)) or data['weight'] <= 0:
                return jsonify({'error': 'Invalid weight'}), 400
            user.weight = data['weight']

        if 'dietary_goals' in data:
            if not isinstance(data['dietary_goals'], str) or len(data['dietary_goals']) > 1000:
                return jsonify({'error': 'Invalid dietary goals'}), 400
            user.dietary_goals = data['dietary_goals']

        if 'allergies' in data:
            if not isinstance(data['allergies'], str) or len(data['allergies']) > 1000:
                return jsonify({'error': 'Invalid allergies'}), 400
            user.allergies = data['allergies']

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        app.logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Logout route (client-side token removal)
@app.route('/api/logout', methods=['POST'])
@csrf.exempt
@jwt_required()
def logout():
    """Logout endpoint - client should remove token"""
    return jsonify({'message': 'Logged out successfully'})

# Additional routes for profile, etc. can be added here
