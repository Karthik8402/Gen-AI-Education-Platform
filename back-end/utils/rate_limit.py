from functools import wraps
from flask import request, jsonify
import time
from collections import defaultdict

# Simple in-memory rate limiter
request_history = defaultdict(list)

def rate_limit(max_requests=5, window=60):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Use user ID if available, otherwise IP
            identifier = request.remote_addr
            if hasattr(request, 'user') and request.user:
                identifier = request.user.get('uid', identifier)
                
            current_time = time.time()
            
            # Filter out old requests
            request_history[identifier] = [t for t in request_history[identifier] if current_time - t < window]
            
            if len(request_history[identifier]) >= max_requests:
                return {"error": "Too many requests, please try again later"}, 429
                
            request_history[identifier].append(current_time)
            return f(*args, **kwargs)
        return wrapper
    return decorator
