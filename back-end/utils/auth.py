from functools import wraps
from flask import request, jsonify
import jwt
import os
from datetime import datetime, timezone, timedelta

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret")

def create_token(user_id, email, role="student"):
    payload = {
        "uid": str(user_id),
        "email": email,
        "role": role,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=24)).timestamp())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def auth_required(f):
    def unauthorized(message="Unauthorized"):
        return {"error": message}, 401
    @wraps(f)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return unauthorized("Missing or invalid Authorization header")
        token = header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return unauthorized("Token has expired")
        except jwt.InvalidTokenError:
            return unauthorized("Invalid token")
        request.user = payload
        return f(*args, **kwargs)
    return wrapper

def role_required(allowed_roles):
    """Decorator to require specific roles for access"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            header = request.headers.get("Authorization", "")
            if not header.startswith("Bearer "):
                return {"error": "Missing or invalid Authorization header"}, 401
            
            token = header.split(" ", 1)[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                request.user = payload
                
                user_role = payload.get("role", "student")
                
                if user_role not in allowed_roles:
                    return {"error": f"Access denied. Required role: {' or '.join(allowed_roles)}"}, 403
                
                return f(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                return {"error": "Token has expired"}, 401
            except jwt.InvalidTokenError:
                return {"error": "Invalid token"}, 401
                
        return wrapper
    return decorator

def validate_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_required_fields(data, required_fields):
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400
    return None
