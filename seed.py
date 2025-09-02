from app import app, db, Quiz, Meal
import json

def seed_data():
    with app.app_context():
        # Clear existing data
        Quiz.query.delete()
        Meal.query.delete()
        db.session.commit()

        # Seed Quiz data
        quiz_data = [
            {
                "title": "Nutrition Basics",
                "description": "Test your basic nutrition knowledge",
                "questions": json.dumps([
                    {
                        "question": "Which vitamin is primarily obtained from sunlight?",
                        "options": ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
                        "answerIndex": 3
                    },
                    {
                        "question": "What nutrient is the main source of energy for the body?",
                        "options": ["Proteins", "Carbohydrates", "Fats", "Vitamins"],
                        "answerIndex": 1
                    },
                    {
                        "question": "Which mineral is important for healthy bones and teeth?",
                        "options": ["Iron", "Calcium", "Potassium", "Zinc"],
                        "answerIndex": 1
                    },
                    {
                        "question": "Which of these is a good source of dietary fiber?",
                        "options": ["White bread", "Brown rice", "Butter", "Cheese"],
                        "answerIndex": 1
                    },
                    {
                        "question": "What is the recommended daily water intake for an average adult?",
                        "options": ["1 liter", "2 liters", "3 liters", "4 liters"],
                        "answerIndex": 1
                    }
                ])
            },
            {
                "title": "Healthy Eating Habits",
                "description": "Learn about healthy eating patterns",
                "questions": json.dumps([
                    {
                        "question": "How many servings of vegetables should you eat daily?",
                        "options": ["1-2 servings", "3-5 servings", "6-8 servings", "9-10 servings"],
                        "answerIndex": 1
                    },
                    {
                        "question": "Which type of fat is considered healthy?",
                        "options": ["Trans fat", "Saturated fat", "Unsaturated fat", "Hydrogenated fat"],
                        "answerIndex": 2
                    },
                    {
                        "question": "What percentage of your plate should be vegetables?",
                        "options": ["10-20%", "25-30%", "40-50%", "60-70%"],
                        "answerIndex": 2
                    }
                ])
            },
            {
                "title": "Food Groups",
                "description": "Understand different food groups and their benefits",
                "questions": json.dumps([
                    {
                        "question": "Which food group provides the most protein?",
                        "options": ["Fruits", "Vegetables", "Grains", "Proteins"],
                        "answerIndex": 3
                    },
                    {
                        "question": "Which food group is the best source of calcium?",
                        "options": ["Fruits", "Dairy", "Grains", "Proteins"],
                        "answerIndex": 1
                    },
                    {
                        "question": "Which food group should make up the largest portion of your diet?",
                        "options": ["Proteins", "Fats", "Carbohydrates", "Sugars"],
                        "answerIndex": 2
                    }
                ])
            }
        ]

        for quiz_item in quiz_data:
            quiz = Quiz(
                title=quiz_item["title"],
                description=quiz_item["description"],
                questions=quiz_item["questions"]
            )
            db.session.add(quiz)

        # Seed Meal data
        meal_data = [
            {
                "name": "Grilled Chicken Salad",
                "calories": 350,
                "nutrients": json.dumps({
                    "protein": 35,
                    "carbs": 15,
                    "fat": 12,
                    "fiber": 8
                }),
                "category": "high-protein",
                "description": "Fresh mixed greens with grilled chicken breast, cherry tomatoes, cucumber, and light vinaigrette dressing."
            },
            {
                "name": "Quinoa Buddha Bowl",
                "calories": 420,
                "nutrients": json.dumps({
                    "protein": 18,
                    "carbs": 55,
                    "fat": 15,
                    "fiber": 12
                }),
                "category": "vegetarian",
                "description": "Nutritious bowl with quinoa, roasted vegetables, chickpeas, avocado, and tahini dressing."
            },
            {
                "name": "Salmon with Sweet Potato",
                "calories": 480,
                "nutrients": json.dumps({
                    "protein": 32,
                    "carbs": 35,
                    "fat": 22,
                    "fiber": 6
                }),
                "category": "high-protein",
                "description": "Omega-3 rich salmon fillet served with baked sweet potato and steamed broccoli."
            },
            {
                "name": "Vegan Stir-Fry",
                "calories": 320,
                "nutrients": json.dumps({
                    "protein": 15,
                    "carbs": 45,
                    "fat": 8,
                    "fiber": 10
                }),
                "category": "vegan",
                "description": "Colorful vegetable stir-fry with tofu, brown rice, and ginger-soy sauce."
            },
            {
                "name": "Greek Yogurt Parfait",
                "calories": 280,
                "nutrients": json.dumps({
                    "protein": 20,
                    "carbs": 35,
                    "fat": 6,
                    "fiber": 4
                }),
                "category": "vegetarian",
                "description": "Creamy Greek yogurt layered with fresh berries, granola, and honey."
            },
            {
                "name": "Turkey Wrap",
                "calories": 380,
                "nutrients": json.dumps({
                    "protein": 28,
                    "carbs": 40,
                    "fat": 12,
                    "fiber": 8
                }),
                "category": "high-protein",
                "description": "Whole grain wrap with turkey, lettuce, tomato, avocado, and mustard."
            },
            {
                "name": "Lentil Soup",
                "calories": 250,
                "nutrients": json.dumps({
                    "protein": 18,
                    "carbs": 35,
                    "fat": 4,
                    "fiber": 15
                }),
                "category": "vegan",
                "description": "Hearty lentil soup with vegetables, herbs, and whole grain bread."
            },
            {
                "name": "Egg White Omelette",
                "calories": 220,
                "nutrients": json.dumps({
                    "protein": 25,
                    "carbs": 8,
                    "fat": 8,
                    "fiber": 3
                }),
                "category": "low-carb",
                "description": "Fluffy egg white omelette with spinach, mushrooms, and feta cheese."
            },
            {
                "name": "Fruit Smoothie Bowl",
                "calories": 320,
                "nutrients": json.dumps({
                    "protein": 12,
                    "carbs": 50,
                    "fat": 8,
                    "fiber": 8
                }),
                "category": "vegetarian",
                "description": "Thick smoothie bowl with mixed berries, banana, yogurt, and granola topping."
            },
            {
                "name": "Grilled Vegetable Skewers",
                "calories": 180,
                "nutrients": json.dumps({
                    "protein": 6,
                    "carbs": 25,
                    "fat": 8,
                    "fiber": 6
                }),
                "category": "vegan",
                "description": "Colorful vegetable skewers with zucchini, bell peppers, mushrooms, and herbs."
            }
        ]

        for meal_item in meal_data:
            meal = Meal(
                name=meal_item["name"],
                calories=meal_item["calories"],
                nutrients=meal_item["nutrients"],
                category=meal_item["category"],
                description=meal_item["description"]
            )
            db.session.add(meal)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
