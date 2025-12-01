from flask import Flask
from flask_cors import CORS
import logging
import os
import spacy

# Import Blueprints
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.quiz import quiz_bp
from routes.analytics import analytics_bp
from routes.content import content_bp

# Configure API
import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)

# ✅ CORS Configuration - Simple and Clean
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:5173",           # Local dev
        "http://localhost:3000",           # Local dev
        "http://127.0.0.1:5173",          # Local dev
        "http://127.0.0.1:3000",          # Local dev
        "https://gen-ai-education-platform-1h0vml9px-karthiks-projects-9cfee133.vercel.app"  # ✅ YOUR FRONTEND URL
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret")

# Initialize logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize spaCy with proper error handling
def load_spacy_model():
    """Load the best available spaCy model"""
    models = ["en_core_web_lg", "en_core_web_md", "en_core_web_sm"]
    
    for model_name in models:
        try:
            nlp = spacy.load(model_name)
            logger.info(f"✅ Loaded spaCy model: {model_name}")
            return nlp, model_name
        except OSError:
            continue
    
    logger.error("❌ No spaCy model found. Install with: python -m spacy download en_core_web_sm")
    return None, None

nlp, spacy_model = load_spacy_model()

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(profile_bp, url_prefix='/api/student/profile')
app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(content_bp, url_prefix='/api/content')

@app.route("/")
def home():
    return {"status": "online", "message": "Gen-AI Education Platform API is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)