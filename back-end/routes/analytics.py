from flask import Blueprint, request
from datetime import datetime, timezone, timedelta
from db import attempts_col, quizzes_col, profiles_col, users_col, courses_col
from utils.auth import auth_required
import logging

analytics_bp = Blueprint('analytics', __name__)
logger = logging.getLogger(__name__)

@analytics_bp.get("/me")
@auth_required
def get_student_analytics():
    """Enhanced student analytics with comprehensive learning insights"""
    try:
        user_id = request.user["uid"]
        
        # Get student data
        student = users_col.find_one({"_id": user_id})
        if not student:
            return {"error": "Student not found"}, 404
        
        # Get profile and attempts
        profile = profiles_col.find_one({"studentId": user_id})
        attempts = list(attempts_col.find({"user_id": user_id}))
        enrolled_courses = list(courses_col.find({"enrolledStudents": user_id}))
        
        # === CORE PERFORMANCE METRICS ===
        total_attempts = len(attempts)
        total_questions = sum(attempt.get("score", {}).get("total", 0) for attempt in attempts)
        total_correct = sum(attempt.get("score", {}).get("correct", 0) for attempt in attempts)
        overall_percentage = round((total_correct / total_questions) * 100, 2) if total_questions > 0 else 0
        
        # === RECENT ATTEMPTS ===
        recent_attempts = sorted(
            attempts, 
            key=lambda x: x.get("submitted_at") or datetime.min.replace(tzinfo=timezone.utc), 
            reverse=True
        )[:10]
        
        # === PERFORMANCE TREND ===
        performance_trend = []
        for i, attempt in enumerate(reversed(recent_attempts)):
            score_data = attempt.get("score", {})
            total = score_data.get("total", 1)
            correct = score_data.get("correct", 0)
            percentage = round((correct / total) * 100, 2) if total > 0 else 0
            
            # ✅ FIX: Safe date formatting
            attempt_date = attempt.get("submitted_at")
            if hasattr(attempt_date, "strftime"):
                date_str = attempt_date.strftime("%Y-%m-%d")
            elif isinstance(attempt_date, str):
                date_str = attempt_date[:10]
            else:
                date_str = datetime.now().strftime("%Y-%m-%d")
            
            performance_trend.append({
                "attempt": i + 1,
                "score": percentage,
                "topic": attempt.get("topic", "Unknown"),
                "difficulty": attempt.get("difficulty", "beginner"),
                "date": date_str
            })
        
        # === TOPIC-WISE ANALYTICS ===
        topic_performance = {}
        difficulty_performance = {"beginner": [], "intermediate": [], "pro": []}
        
        for attempt in attempts:
            topic = attempt.get("topic", "General")
            difficulty = attempt.get("difficulty", "beginner")
            
            # ✅ FIX: Use stored percentage or calculate
            percentage = attempt.get("percentage")
            if percentage is None:
                score_data = attempt.get("score", {})
                total = score_data.get("total", 1)
                correct = score_data.get("correct", 0)
                percentage = (correct / total) * 100 if total > 0 else 0
            
            # Topic analysis
            if topic not in topic_performance:
                topic_performance[topic] = {"attempts": 0, "total_score": 0, "avg_score": 0}
            topic_performance[topic]["attempts"] += 1
            topic_performance[topic]["total_score"] += percentage
            topic_performance[topic]["avg_score"] = round(
                topic_performance[topic]["total_score"] / topic_performance[topic]["attempts"], 
                2
            )
            
            # Difficulty analysis
            if difficulty in difficulty_performance:
                difficulty_performance[difficulty].append(percentage)
        
        # Calculate difficulty averages
        difficulty_analytics = {}
        for diff, scores in difficulty_performance.items():
            if scores:
                difficulty_analytics[diff] = {
                    "avg_score": round(sum(scores) / len(scores), 2),
                    "attempts": len(scores),
                    "improvement": round((scores[-1] - scores[0]) if len(scores) > 1 else 0, 2)
                }
            else:
                difficulty_analytics[diff] = {"avg_score": 0, "attempts": 0, "improvement": 0}
        
        # === LEARNING PATTERNS & INSIGHTS ===
        current_skill_level = "beginner"
        learning_velocity = 0
        consistency_score = 0
        
        if profile:
            current_skill_level = profile.get("profile", {}).get("skillLevel", "beginner")
        
        if len(recent_attempts) >= 3:
            recent_scores = []
            for att in recent_attempts[:5]:
                perc = att.get("percentage")
                if perc is None:
                    score = att.get("score", {})
                    total = score.get("total", 1)
                    correct = score.get("correct", 0)
                    perc = (correct / total) * 100 if total > 0 else 0
                recent_scores.append(perc)
            
            if len(recent_scores) > 1:
                learning_velocity = round((recent_scores[0] - recent_scores[-1]) / len(recent_scores), 2)
            
            if recent_scores:
                mean_score = sum(recent_scores) / len(recent_scores)
                variance = sum((score - mean_score) ** 2 for score in recent_scores) / len(recent_scores)
                consistency_score = max(0, round(100 - variance, 2))
        
        # === PERSONALIZED RECOMMENDATIONS ===
        recommendations = []
        weak_topics = sorted(topic_performance.items(), key=lambda x: x[1]["avg_score"])[:3]
        strong_topics = sorted(topic_performance.items(), key=lambda x: x[1]["avg_score"], reverse=True)[:3]
        
        if overall_percentage < 60:
            recommendations.append({
                "type": "skill_building",
                "title": "Focus on Fundamentals",
                "description": "Your overall score suggests focusing on basic concepts. Try beginner-level quizzes in your weak areas.",
                "action": "Take more beginner quizzes",
                "priority": "high"
            })
        
        if weak_topics:
            recommendations.append({
                "type": "topic_improvement", 
                "title": f"Improve in {weak_topics[0][0]}",
                "description": f"Your average score in {weak_topics[0][0]} is {weak_topics[0][1]['avg_score']}%. Consider additional practice.",
                "action": f"Practice more {weak_topics[0][0]} questions",
                "priority": "medium"
            })
        
        if learning_velocity < 0:
            recommendations.append({
                "type": "consistency",
                "title": "Maintain Learning Momentum", 
                "description": "Your recent performance shows a downward trend. Regular practice can help improve consistency.",
                "action": "Set a daily quiz goal",
                "priority": "medium"
            })
        
        # === ACHIEVEMENTS & MILESTONES ===
        achievements = []
        if total_attempts >= 10:
            achievements.append({"badge": "Quiz Master", "description": "Completed 10+ quizzes"})
        if overall_percentage >= 80:
            achievements.append({"badge": "High Achiever", "description": "80%+ overall accuracy"})
        if len(topic_performance) >= 5:
            achievements.append({"badge": "Explorer", "description": "Practiced 5+ different topics"})
        
        # === LEARNING STREAKS ===
        learning_streak = 0
        if attempts:
            attempt_dates = []
            for attempt in attempts:
                submitted = attempt.get("submitted_at")
                if hasattr(submitted, "date"):
                    attempt_dates.append(submitted.date())
                elif isinstance(submitted, str):
                    try:
                        attempt_dates.append(
                            datetime.fromisoformat(submitted.replace("Z", "+00:00")).date()
                        )
                    except:
                        pass
            
            if attempt_dates:
                unique_dates = sorted(set(attempt_dates), reverse=True)
                current_date = datetime.now().date()
                
                for i, date in enumerate(unique_dates):
                    if (current_date - date).days == i:
                        learning_streak += 1
                    else:
                        break
        
        # ✅ FIX: Helper function for date formatting
        def format_date(dt):
            """Safely format datetime to ISO string"""
            if dt is None:
                return None
            if hasattr(dt, "isoformat"):
                return dt.isoformat()
            if isinstance(dt, str):
                return dt
            return str(dt)
        
        # === COMPREHENSIVE RESPONSE ===
        return {
            "status": "success",
            "analytics": {
                "student": {
                    "id": user_id,
                    "email": student.get("email"),
                    "username": student.get("username", student.get("email", "").split("@")[0]),
                    "memberSince": format_date(student.get("created_at")),
                    "currentSkillLevel": current_skill_level
                },
                
                "performance": {
                    "totalAttempts": total_attempts,
                    "totalQuestions": total_questions,
                    "totalCorrect": total_correct,
                    "overallAccuracy": overall_percentage,
                    "averageScore": round(overall_percentage, 2),
                    "learningVelocity": learning_velocity,
                    "consistencyScore": consistency_score,
                    "learningStreak": learning_streak
                },
                
                "charts": {
                    "performanceTrend": performance_trend,
                    "topicPerformance": [
                        {"topic": topic, "avgScore": data["avg_score"], "attempts": data["attempts"]} 
                        for topic, data in topic_performance.items()
                    ],
                    "difficultyBreakdown": difficulty_analytics,
                    "skillProgression": [
                        {"level": "Beginner", "score": difficulty_analytics.get("beginner", {}).get("avg_score", 0)},
                        {"level": "Intermediate", "score": difficulty_analytics.get("intermediate", {}).get("avg_score", 0)},
                        {"level": "Advanced", "score": difficulty_analytics.get("pro", {}).get("avg_score", 0)}
                    ]
                },
                
                "insights": {
                    "strongestTopics": [{"topic": topic, "score": data["avg_score"]} for topic, data in strong_topics],
                    "weakestTopics": [{"topic": topic, "score": data["avg_score"]} for topic, data in weak_topics],
                    "recommendations": recommendations,
                    "achievements": achievements,
                    "nextMilestone": "Complete 5 more quizzes to unlock Advanced Analytics" if total_attempts < 15 else "Maintain your excellent progress!"
                },
                
                "courses": {
                    "enrolled": len(enrolled_courses),
                    "courseList": [
                        {
                            "courseId": str(course.get("_id")),
                            "title": course.get("title"),
                            "instructor": course.get("instructorName"),
                            "difficulty": course.get("difficultyLevel", "intermediate"),
                            "enrolledAt": format_date(course.get("updated_at"))
                        } for course in enrolled_courses
                    ]
                },
                
                # ✅ FIXED: Recent Activity with proper date handling
                "recentActivity": [
                    {
                        "attemptId": str(attempt.get("_id")),
                        "topic": attempt.get("topic", "Unknown"),
                        "category": attempt.get("category", "General"),
                        "score": attempt.get("score", {}),
                        "percentage": attempt.get("percentage") or round(
                            (attempt.get("score", {}).get("correct", 0) / max(attempt.get("score", {}).get("total", 1), 1)) * 100, 
                            2
                        ),
                        "difficulty": attempt.get("difficulty", "beginner"),
                        "submittedAt": (
                            attempt.get("submittedAt") or 
                            format_date(attempt.get("submitted_at"))
                        )
                    } for attempt in recent_attempts[:5]
                ],
                
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
                "dataRange": f"Last {total_attempts} attempts" if total_attempts > 0 else "No quiz data available"
            }
        }, 200
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return {"error": f"Failed to load analytics: {str(e)}"}, 500
