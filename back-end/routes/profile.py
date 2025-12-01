from flask import Blueprint, request
from datetime import datetime, timezone
from pymongo import ReturnDocument
import logging

from db import profiles_col, attempts_col, users_col
from utils.auth import auth_required
from services.ml_predictor import AdvancedMLPredictor

profile_bp = Blueprint('profile', __name__)
logger = logging.getLogger(__name__)

# Initialize ML Predictor
ml_predictor = AdvancedMLPredictor()

@profile_bp.post("")
@auth_required
def create_or_update_student_profile():
    """Create or update student profile with proper schema and database compatibility"""
    try:
        body = request.get_json(force=True)
        user_id = request.user["uid"]
        
        # Validation
        required_fields = ['name', 'age', 'learningStyle', 'department']
        missing_fields = [field for field in required_fields if not body.get(field)]
        
        if missing_fields:
            return {
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }, 400
        
        # Check if profile exists (using studentId consistently)
        existing_profile = profiles_col.find_one({"studentId": user_id})
        current_time = datetime.now(timezone.utc)
        
        # Create nested profile document structure that matches GET expectations
        profile_doc = {
            "studentId": user_id,  # ✅ Use studentId consistently
            "profile": {
                "name": body['name'].strip(),
                "skillLevel": (existing_profile or {}).get('profile', {}).get('skillLevel', 'beginner'),
                "skillConfidence": (existing_profile or {}).get('profile', {}).get('skillConfidence', 0.5),
                "lastSkillUpdate": (existing_profile or {}).get('profile', {}).get('lastSkillUpdate', current_time.isoformat()),
                "strengths": (existing_profile or {}).get('profile', {}).get('strengths', []),
                "improvement_areas": (existing_profile or {}).get('profile', {}).get('improvement_areas', []),
                "preferred_topics": (existing_profile or {}).get('profile', {}).get('preferred_topics', [])
            },
            "demographics": {
                "name": body['name'].strip(),  # Also store in demographics for compatibility
                "age": int(body['age']),
                "department": body['department'].strip(),
                "educationLevel": body.get('educationLevel', 'undergraduate')
            },
            "cognitiveProfile": {
                "learningStyle": body['learningStyle']
            },
            "performanceMetrics": (existing_profile or {}).get('performanceMetrics', {
                "totalAttempts": 0,
                "averageScore": 0.0,
                "completionRate": 0.0,
                "streakDays": 0,
                "timePerTopic": 0
            }),
            "updated_at": current_time,
            "created_at": (existing_profile or {}).get('created_at', current_time)
        }
        
        if existing_profile:
            # Update existing profile
            try:
                result = profiles_col.find_one_and_update(
                    {"studentId": user_id},
                    {"$set": profile_doc},
                    return_document=ReturnDocument.AFTER
                )
                message = "Profile updated successfully"
            except (TypeError, NameError):
                profiles_col.update_one(
                    {"studentId": user_id}, 
                    {"$set": profile_doc}, 
                    upsert=True
                )
                result = profiles_col.find_one({"studentId": user_id})
                message = "Profile updated successfully"
        else:
            # Create new profile
            try:
                insert_result = profiles_col.insert_one(profile_doc)
                profile_doc["_id"] = insert_result.inserted_id
                result = profile_doc
                message = "Profile created successfully"
            except Exception as db_error:
                if hasattr(profiles_col, '_data'):
                    profile_doc["_id"] = f"profile_{user_id}"
                    profiles_col._data.append(profile_doc)
                    result = profile_doc
                    message = "Profile created successfully"
                else:
                    raise db_error
        
        return {
            "status": "success",
            "message": message,
            "profile": {
                "user_id": user_id,
                "name": result.get("profile", {}).get("name", result.get("demographics", {}).get("name", "User")),
                "skill_level": result.get("profile", {}).get("skillLevel", "beginner"),
                "learning_style": result.get("cognitiveProfile", {}).get("learningStyle", "visual"),
                "department": result.get("demographics", {}).get("department", "General"),
                "education_level": result.get("demographics", {}).get("educationLevel", "undergraduate"),
                "age": result.get("demographics", {}).get("age", 0),
                "total_quizzes": result.get("performanceMetrics", {}).get("totalAttempts", 0),
                "avg_score": result.get("performanceMetrics", {}).get("averageScore", 0.0),
                "skill_confidence": result.get("profile", {}).get("skillConfidence", 0.5),
                "strengths": result.get("profile", {}).get("strengths", []),
                "improvement_areas": result.get("profile", {}).get("improvement_areas", []),
                "preferred_topics": result.get("profile", {}).get("preferred_topics", []),
                "created_at": result.get("created_at"),
                "updated_at": result.get("updated_at")
            }
        }, 200
        
    except ValueError as ve:
        return {"error": f"Invalid data format: {str(ve)}"}, 400
    except Exception as e:
        logger.error(f"Profile creation error: {str(e)}")
        return {"error": "Failed to save profile. Please try again."}, 500

@profile_bp.get("/me")
@auth_required
def get_my_profile():
    """Get current user's profile - RESPECTS PLACEMENT QUIZ RESULTS"""
    try:
        user_id = request.user["uid"]
        
        # Find existing profile
        profile = profiles_col.find_one({"studentId": user_id})
        
        if not profile:
            # ✅ Return default profile for new users
            user_doc = users_col.find_one({"_id": user_id})
            
            return {
                "status": "success",
                "profile": {
                    "user_id": user_id,
                    "name": user_doc.get("name", user_doc.get("email", "").split("@")[0]) if user_doc else "User",
                    "age": None,
                    "department": "General",
                    "learning_style": "visual",
                    "education_level": "undergraduate",
                    "current_skill_level": "beginner",
                    "skill_confidence": 0.5,
                    "total_quizzes": 0,
                    "avg_score": 0.0,
                    "learning_streak": 0,
                    "strengths": [],
                    "improvement_areas": [],
                    "preferred_topics": [],
                    "placement_completed": False,  # ✅ Added placement status
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "isNewUser": True
                }
            }, 200
        
        # ✅ Get recent attempts for metrics calculation
        try:
            recent_attempts_cursor = attempts_col.find({"user_id": user_id})
            
            if hasattr(recent_attempts_cursor, 'sort') and hasattr(recent_attempts_cursor, 'limit'):
                recent_attempts = list(recent_attempts_cursor.sort("submitted_at", -1).limit(10))
            else:
                all_attempts = list(recent_attempts_cursor)
                recent_attempts = sorted(
                    all_attempts, 
                    key=lambda x: x.get("submitted_at", datetime.now()), 
                    reverse=True
                )[:10]
        except Exception:
            recent_attempts = []
            
        # Calculate dynamic metrics
        total_quizzes = attempts_col.count_documents({"user_id": user_id})
        
        # Calculate average score
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "avg_score": {"$avg": "$percentage"}}}
        ]
        try:
            avg_result = list(attempts_col.aggregate(pipeline))
            avg_score = round(avg_result[0]['avg_score'], 1) if avg_result else 0.0
        except Exception:
            avg_score = 0.0

        # Construct response
        return {
            "status": "success",
            "profile": {
                "user_id": user_id,
                "name": profile.get("profile", {}).get("name", "User"),
                "age": profile.get("demographics", {}).get("age"),
                "department": profile.get("demographics", {}).get("department", "General"),
                "learning_style": profile.get("cognitiveProfile", {}).get("learningStyle", "visual"),
                "education_level": profile.get("demographics", {}).get("educationLevel", "undergraduate"),
                
                # Dynamic Skill Level (from placement or ML)
                "current_skill_level": profile.get("profile", {}).get("skillLevel", "beginner"),
                "skill_confidence": profile.get("profile", {}).get("skillConfidence", 0.5),
                
                # Metrics
                "total_quizzes": total_quizzes,
                "avg_score": avg_score,
                "learning_streak": profile.get("performanceMetrics", {}).get("streakDays", 0),
                
                # Insights
                "strengths": profile.get("profile", {}).get("strengths", []),
                "improvement_areas": profile.get("profile", {}).get("improvement_areas", []),
                "preferred_topics": profile.get("profile", {}).get("preferred_topics", []),
                
                # Status
                "placement_completed": profile.get("profile", {}).get("skillLevel") != "beginner" or total_quizzes > 0,
                "created_at": profile.get("created_at"),
                "updated_at": profile.get("updated_at"),
                "isNewUser": False
            }
        }, 200

    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return {"error": "Failed to fetch profile"}, 500

@profile_bp.post("/predict-level")
@auth_required
def predict_student_level():
    """Advanced ML endpoint to predict student skill level using Random Forest"""
    try:
        user_id = request.user["uid"]
        
        # Get student's performance data
        student_attempts = list(attempts_col.find({"user_id": user_id}))
        student_profile = profiles_col.find_one({"studentId": user_id})
        
        if not student_attempts:
            return {
                "status": "success",
                "predictedLevel": "beginner",
                "confidence": 0.5,
                "message": "No quiz data available, defaulting to beginner",
                "recommendations": ["Take some practice quizzes to get personalized predictions"]
            }
        
        # Use advanced ML prediction
        prediction_result = ml_predictor.predict_skill_level(student_attempts, student_profile)
        
        # Update student profile with prediction
        try:
            profiles_col.find_one_and_update(
                {"studentId": user_id},
                {
                    "$set": {
                        "profile.skillLevel": prediction_result['predicted_level'],
                        "performanceMetrics.averageScore": prediction_result['performance_score'],
                        "lastPrediction": {
                            "predictedAt": datetime.now(timezone.utc).isoformat(),
                            "confidence": prediction_result['confidence'],
                            "model": "RandomForest",
                            "featureImportance": prediction_result['feature_importance']
                        }
                    }
                }
            )
        except Exception as e:
            logger.warning(f"Could not update profile: {e}")
        
        # Generate personalized recommendations
        recommendations = ml_predictor.get_learning_recommendations(prediction_result, student_attempts)
        
        return {
            "status": "success",
            "predictedLevel": prediction_result['predicted_level'],
            "confidence": prediction_result['confidence'],
            "performanceScore": prediction_result['performance_score'],
            "skillProbabilities": prediction_result['skill_probabilities'],
            "featureImportance": prediction_result['feature_importance'],
            "recommendations": recommendations,
            "model": "RandomForest",
            "totalAttempts": len(student_attempts)
        }
        
    except Exception as e:
        logger.error(f"Error in predict_student_level: {str(e)}")
        return {"error": str(e)}, 500
