from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from bson import ObjectId

from db import users_col, quizzes_col, attempts_col, profiles_col
from utils.auth import create_token, auth_required, validate_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.post("/signup")
@auth_bp.post("/register")
def signup():
    body = request.get_json(force=True)
    username = body.get("username", "").strip()
    email = body.get("email", "").lower().strip()
    password = body.get("password", "")
    
    if not username or not email or not password:
        return {"error": "All fields are required"}, 400
    
    if users_col.find_one({"email": email}):
        return {"error": "Email already registered"}, 409
    
    user_doc = {
        "username": username,
        "email": email,
        "password_hash": generate_password_hash(password),
        "role": "student",
        "created_at": datetime.now(timezone.utc),
    }
    
    res = users_col.insert_one(user_doc)
    user_id = str(res.inserted_id)
    
    token = create_token(user_id, email, user_doc["role"])
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "username": username,
            "email": email,
            "role": user_doc["role"]
        }
    }, 201

@auth_bp.post("/login")
def login():
    body = request.get_json(force=True)
    email = body.get("email","").lower().strip()
    password = body.get("password","")
    
    user = users_col.find_one({"email": email})
    
    if not user or not check_password_hash(user.get("password_hash",""), password):
        return {"error": "Invalid credentials"}, 401
    
    token = create_token(user["_id"], email, user.get("role","student"))
    
    return {
        "token": token, 
        "user": {
            "id": str(user["_id"]),
            "email": email, 
            "username": user.get("username") or user.get("name"), 
            "role": user.get("role","student")
        }
    }

@auth_bp.route("/me", methods=["GET"])
@auth_required
def me():
    uid = request.user["uid"]
    
    user_doc = None
    
    if not hasattr(users_col, '_data'):
        try:
            user_doc = users_col.find_one({"_id": ObjectId(uid)})
        except Exception:
            pass
    
    if not user_doc:
        user_doc = users_col.find_one({"_id": uid})
    
    if not user_doc:
        return {"error": "User not found"}, 404
    
    # Get statistics
    try:
        quiz_count = quizzes_col.count_documents({"user_id": uid})
        attempt_count = attempts_col.count_documents({"user_id": uid})
    except Exception:
        quiz_count = attempt_count = 0
    
    try:
        profile = profiles_col.find_one({"studentId": uid})
        skill_level = profile.get('profile', {}).get('skillLevel', 'beginner') if profile else 'beginner'
    except Exception:
        skill_level = 'beginner'
    
    return {
        "user": {
            "uid": uid,
            "email": user_doc.get("email"),
            "username": user_doc.get("username") or user_doc.get("name"),
            "role": user_doc.get("role", "student")
        },
        "stats": {
            "quizzesCreated": quiz_count,
            "attemptsCompleted": attempt_count,
            "memberSince": user_doc.get("created_at").isoformat() + "Z" if isinstance(user_doc.get("created_at"), datetime) else str(user_doc.get("created_at")),
            "skillLevel": skill_level
        }
    }
