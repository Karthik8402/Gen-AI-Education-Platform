from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import logging
import numpy as np
from db import profiles_col
from utils.auth import auth_required
from utils.rate_limit import rate_limit
from services.nlp_processor import AdvancedEducationalNLP

content_bp = Blueprint('content', __name__)
logger = logging.getLogger(__name__)

# Initialize NLP Processor
nlp_processor = AdvancedEducationalNLP()

@content_bp.post("/generate")
@auth_required  
@rate_limit(max_requests=5, window=60)
def generate_nlp_enhanced_content():  
    """Generate content with automatic skill prediction and 18 comprehensive quiz questions"""
    try:
        body = request.get_json(force=True)
        user_id = request.user["uid"]

        topic = body.get('topic', '').strip()
        content_type = body.get('contentType', 'explanation')
        difficulty_override = body.get('difficulty', '')
        
        if not topic:
            return {"error": "Topic is required"}, 400
        
        # Get profile and predict skill level
        profile = profiles_col.find_one({"studentId": user_id})
        
        if not profile:
            learning_style = 'visual'
            department = 'general'
            predicted_skill_level = 'beginner'
            confidence = 0.3
        else:
            demographics = profile.get('demographics', {})
            cognitive_profile = profile.get('cognitiveProfile', {})
            
            learning_style = cognitive_profile.get('learningStyle', 'visual')
            department = demographics.get('department', 'general')
            
            predicted_skill_level, confidence = predict_student_skill_level_from_profile(profile, topic)
        
        effective_difficulty = difficulty_override or predicted_skill_level
        
        logger.info(f"🤖 PREDICTED: {predicted_skill_level} (confidence: {confidence:.2f}) | USING: {effective_difficulty} | {topic} | {learning_style} | {department}")
        
        # Generate content
        logger.info("🚀 Generating content with nlp_processor...")
        
        content_result = nlp_processor.generate_educational_content(
            topic=topic,
            difficulty_level=effective_difficulty,
            learning_style=learning_style,
            content_type=content_type,
            subject=department
        )
        
        if not content_result:
            logger.error("Content generation failed")
            return {"error": "Failed to generate content"}, 500
        
        # Generate quiz
        logger.info("❓ Generating comprehensive quiz questions...")
        quiz_questions = nlp_processor.generate_smart_quiz_questions(
            content_result.get('enhanced_content', ''), 
            num_questions=18,
            difficulty_level=effective_difficulty,
            topic=topic
        )
        
        result = {
            "status": "success",
            "content": {
                "topic": topic,
                "content_type": content_type,
                "difficulty_level": effective_difficulty,
                "predicted_level": predicted_skill_level,
                "prediction_confidence": round(confidence, 2),
                "personalization": {
                    "learning_style": learning_style,
                    "department": department,
                    "skill_confidence": confidence,
                    "auto_predicted": not difficulty_override
                },
                
                # ✅ FIXED: Content sections with fallback to enhanced_content
                "explanation": (
                    content_result.get('explanation', '').strip() or 
                    content_result.get('enhanced_content', '').strip() or 
                    content_result.get('raw_content', '').strip() or
                    'No content available'
                ),
                "example": (
                    content_result.get('examples', '').strip() or 
                    content_result.get('example', '').strip() or
                    ''
                ),
                "exercise": (
                    content_result.get('exercises', '').strip() or 
                    content_result.get('exercise', '').strip() or
                    ''
                ),
                "learning_tip": (
                    content_result.get('learning_tips', '').strip() or 
                    content_result.get('learning_tip', '').strip() or
                    ''
                ),
                "quiz_questions": quiz_questions,
                
                # Analytics
                "skill_prediction": {
                    "predicted_level": predicted_skill_level,
                    "confidence_score": round(confidence, 2),
                    "prediction_factors": get_prediction_factors_from_profile(profile),
                    "manual_override": bool(difficulty_override),
                    "prediction_method": "profile_analytics"
                },
                
                "quiz_analytics": {
                    "total_questions": len(quiz_questions),
                    "skill_assessment_ready": len(quiz_questions) >= 15,
                    "prediction_validation": True,
                    "comprehensive_assessment": True,
                    "difficulty_match": effective_difficulty,
                    "nlp_enhanced": True
                },
                
                # Metadata (updated to count actual content)
                "word_count": len(
                    (content_result.get('explanation', '') or 
                    content_result.get('enhanced_content', '')).split()
                ),
                "estimated_reading_time": max(
                    1, 
                    len((content_result.get('explanation', '') or 
                        content_result.get('enhanced_content', '')).split()) // 200
                ),
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "ai_generated": True,
                "nlp_enhanced": True,
                "auto_predicted": True,
                "spacy_model": "en_core_web_md"
            }
        }
                
        update_profile_with_prediction_insights(
            user_id, 
            predicted_skill_level, 
            confidence, 
            content_result.get('content_analysis', {}),  # ✅ FIXED
            topic
        )
        
        logger.info(f"✅ Generated content: {predicted_skill_level}→{effective_difficulty} | {len(quiz_questions)} questions | confidence: {confidence:.2f}")
        return result, 200
        
    except Exception as e:
        logger.error(f"Enhanced content generation error: {str(e)}")
        return {"error": "Failed to generate content. Please try again."}, 500

def predict_student_skill_level_from_profile(profile, topic):
    """Predict student's skill level using your existing profile structure"""
    
    # Extract data from your profile structure
    profile_data = profile.get('profile', {})
    demographics = profile.get('demographics', {})
    cognitive_profile = profile.get('cognitiveProfile', {})
    performance_metrics = profile.get('performanceMetrics', {})
    subject_proficiency = profile.get('subjectProficiency', {})
    learning_history = profile_data.get('learningHistory', [])
    
    # Initialize prediction factors
    factors = {
        'current_skill_level': profile_data.get('skillLevel', 'beginner'),
        'average_score': performance_metrics.get('averageScore', 0) / 100.0,  # Normalize to 0-1
        'completion_rate': performance_metrics.get('completionRate', 0) / 100.0,
        'streak_days': min(performance_metrics.get('streakDays', 0) / 30.0, 1.0),  # Max 30 days
        'time_per_topic': performance_metrics.get('timePerTopic', 0),
        'total_attempts': len(learning_history),
        'subject_expertise': 0.0,
        'learning_consistency': 0.0
    }
    
    # Calculate subject expertise based on topic relevance
    topic_lower = topic.lower()
    programming_subjects = ['programming', 'computer science', 'software', 'coding', 'react', 'javascript', 'python', 'web development']
    
    subject_scores = []
    for subject, level in subject_proficiency.items():
        # Check if subject is relevant to the topic
        if any(prog_subj in topic_lower or prog_subj in subject.lower() for prog_subj in programming_subjects):
            level_mapping = {'beginner': 0.2, 'intermediate': 0.6, 'pro': 1.0, 'expert': 1.0}
            subject_scores.append(level_mapping.get(level, 0.3))
    
    factors['subject_expertise'] = np.mean(subject_scores) if subject_scores else 0.3
    
    # Calculate learning consistency
    if factors['completion_rate'] > 0 and factors['streak_days'] > 0:
        factors['learning_consistency'] = (factors['completion_rate'] + factors['streak_days']) / 2.0
    
    # Use current skill level as strong base indicator
    current_level = factors['current_skill_level']
    level_mapping = {'beginner': 0.2, 'intermediate': 0.6, 'pro': 0.9, 'expert': 0.9}
    base_score = level_mapping.get(current_level, 0.3)
    
    # Weighted prediction algorithm
    weights = {
        'base_score': 0.40,           # Current skill level is strong indicator
        'average_score': 0.20,        # Recent performance
        'subject_expertise': 0.15,    # Domain knowledge
        'completion_rate': 0.10,      # Engagement level
        'learning_consistency': 0.10,  # Consistency in learning
        'streak_days': 0.05          # Recent activity
    }
    
    # Calculate weighted skill score
    skill_score = 0.0
    total_weight = 0.0
    
    # Add base score from current skill level
    skill_score += weights['base_score'] * base_score
    total_weight += weights['base_score']
    
    # Add other factors
    for factor, value in factors.items():
        if factor != 'current_skill_level' and factor in weights and value is not None:
            normalized_value = max(0.0, min(1.0, float(value)))  # Ensure 0-1 range
            skill_score += weights[factor] * normalized_value
            total_weight += weights[factor]
    
    # Normalize skill score
    if total_weight > 0:
        skill_score = skill_score / total_weight
    else:
        skill_score = 0.3  # Default for new users
    
    # Map skill score to difficulty levels with confidence
    if skill_score < 0.4:
        predicted_level = 'beginner'
        confidence = 0.7 + min(0.2, (0.4 - skill_score) * 2)  # Higher confidence for clear beginners
    elif skill_score < 0.7:
        predicted_level = 'intermediate' 
        confidence = 0.6 + (0.2 * (1 - abs(skill_score - 0.55) * 2))  # Lower confidence in middle range
    else:
        predicted_level = 'expert'
        confidence = 0.7 + min(0.25, (skill_score - 0.7) * 2)  # Higher confidence for clear experts
    
    # Adjust confidence based on data completeness
    non_zero_factors = sum(1 for v in factors.values() if isinstance(v, (int, float)) and v > 0)
    data_completeness = non_zero_factors / len(factors)
    confidence = min(confidence + (data_completeness * 0.1), 0.95)
    
    logger.info(f"🔍 Profile prediction: score={skill_score:.2f}, current_level={current_level}, factors={non_zero_factors}/{len(factors)}")
    
    return predicted_level, confidence

def generate_prediction_learning_tips(nlp_analysis, learning_style, department, predicted_level, confidence):
    """Generate learning tips based on skill prediction"""
    
    tips = []
    
    # Prediction-specific tips
    if confidence > 0.8:
        tips.append(f"🎯 **High Confidence Prediction**: Content is precisely tailored to your {predicted_level} level")
    elif confidence < 0.5:
        tips.append(f"🔄 **Adaptive Content**: Content includes multiple levels as we learn your preferences")
    else:
        tips.append(f"📊 **Skill Assessment**: Based on your profile, this content matches your {predicted_level} level")
    
    # Level-specific advice
    level_tips = {
        'beginner': [
            "🌱 **Foundation Building**: Focus on understanding core concepts before moving to advanced topics",
            "📖 **Learning Strategy**: Take your time with examples and practice basic implementations"
        ],
        'intermediate': [
            "🔧 **Skill Development**: Apply concepts to real projects to strengthen understanding", 
            "🤝 **Collaboration**: Consider working with others to learn different approaches"
        ],
        'expert': [
            "🚀 **Advanced Application**: Challenge yourself with complex scenarios and optimization",
            "👨‍🏫 **Knowledge Sharing**: Teaching others can deepen your own understanding"
        ]
    }
    
    tips.extend(level_tips.get(predicted_level, level_tips['intermediate']))
    
    # Add NLP-based tips
    complexity = nlp_analysis['educational']['concept_complexity']
    if complexity > 0.6:
        tips.append("🧩 **Complex Content**: Break down into smaller parts and study systematically")
    
    # Learning style tips
    style_tips = {
        'visual': "🎨 Create diagrams and visual summaries of key concepts",
        'auditory': "🎧 Read content aloud or discuss with study partners", 
        'kinesthetic': "✋ Practice concepts through hands-on coding exercises",
        'reading': "📝 Write detailed notes and summaries in your own words"
    }
    
    tips.append(style_tips.get(learning_style, style_tips['visual']))
    
    return '\n'.join([f"- {tip}" for tip in tips[:7]])

def get_prediction_factors_from_profile(profile):
    """Get human-readable factors that influenced prediction"""
    if not profile:
        return ["New user - starting with beginner level"]
    
    factors = []
    profile_data = profile.get('profile', {})
    performance = profile.get('performanceMetrics', {})
    
    # Current skill level
    current_level = profile_data.get('skillLevel', 'beginner')
    factors.append(f"Current skill level: {current_level}")
    
    # Performance metrics
    if performance.get('averageScore', 0) > 0:
        factors.append(f"Average score: {performance['averageScore']}%")
    if performance.get('completionRate', 0) > 0:
        factors.append(f"Completion rate: {performance['completionRate']}%")
    if performance.get('streakDays', 0) > 0:
        factors.append(f"Learning streak: {performance['streakDays']} days")
    
    # Subject proficiency
    subject_prof = profile.get('subjectProficiency', {})
    if subject_prof:
        proficient_subjects = [f"{k}: {v}" for k, v in subject_prof.items() if v != 'beginner']
        if proficient_subjects:
            factors.extend(proficient_subjects[:2])  # Top 2 subjects
    
    # Learning history
    learning_history = profile_data.get('learningHistory', [])
    if learning_history:
        factors.append(f"Learning attempts: {len(learning_history)}")
    
    return factors[:6]  # Return top 6 factors

# ✅ REPLACE Function #2 with this SAFE version
def update_profile_with_prediction_insights(user_id, predicted_level, confidence, nlp_analysis, topic):
    """Update user profile with prediction and content interaction data"""
    try:
        # Safe extraction with defaults
        overall_score = 0.0
        concept_complexity = 0.5
        readability_score = 0.5
        
        # Safely extract NLP analysis data
        if nlp_analysis and isinstance(nlp_analysis, dict):
            # Get quality score
            quality = nlp_analysis.get('quality', {})
            if isinstance(quality, dict):
                overall_score = quality.get('overall_quality', 0.0)
            
            # Get educational metrics
            educational = nlp_analysis.get('educational', {})
            if isinstance(educational, dict):
                concept_complexity = educational.get('concept_complexity', 0.5)
            
            # Get readability
            linguistic = nlp_analysis.get('linguistic', {})
            if isinstance(linguistic, dict):
                readability = linguistic.get('readability', {})
                if isinstance(readability, dict):
                    readability_score = readability.get('flesch_reading_ease', 0.5)
        
        update_data = {
            "lastPredictedLevel": predicted_level,
            "predictionConfidence": confidence,
            "lastContentTopic": topic,
            "contentInteractionAt": datetime.now(timezone.utc),
            "predictionValidation": {
                "contentQuality": overall_score,
                "conceptComplexity": concept_complexity,
                "readabilityScore": readability_score,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
        
        profiles_col.update_one(
            {"studentId": user_id},
            {"$set": update_data},
            upsert=True
        )
        
        logger.info(f"✅ Profile updated with prediction data: {predicted_level} (confidence: {confidence:.2f})")
        
    except Exception as e:
        logger.warning(f"Failed to update profile with prediction data: {e}")                

def calculate_avg_complexity(questions):
    """Calculate average complexity of quiz questions"""
    if not questions:
        return 0.5
    
    complexities = [q.get('complexity_score', 0.5) for q in questions]
    return sum(complexities) / len(complexities)

def generate_fallback_content(topic, level, learning_style, department):
    """Generate fallback content when AI is unavailable"""
    
    content = f"""
# Understanding {topic}

## Introduction

{topic} is an important concept in {department} that {level}-level students should understand. This content is designed for {learning_style} learners to provide comprehensive coverage of the subject.

## Key Concepts

The fundamental principles of {topic} include:
- Core definitions and terminology
- Essential processes and mechanisms  
- Practical applications and use cases
- Best practices and guidelines

## How {topic} Works

{topic} operates through a systematic approach that involves multiple components working together. Understanding these mechanisms is crucial for effective implementation and application.

## Applications in {department}

In the field of {department}, {topic} has numerous practical applications:
- Real-world problem solving
- Industry standard practices
- Research and development
- Academic and professional contexts

## Best Practices

When working with {topic}, consider these recommendations:
- Follow established methodologies
- Maintain consistent approaches
- Document processes and outcomes
- Continuously update knowledge and skills

## Common Challenges

Students often encounter these challenges when learning {topic}:
- Understanding complex concepts
- Applying theory to practice  
- Staying updated with developments
- Integrating with other knowledge areas

## Summary

Mastering {topic} requires dedication, practice, and continuous learning. This foundational knowledge will serve as a stepping stone for more advanced concepts in {department}.
"""

    fallback_questions = [
        {
            "question": f"What is the primary focus of {topic}?",
            "choices": [
                f"Understanding core principles of {topic}",
                "Memorizing technical definitions",
                "Avoiding practical applications", 
                "Ignoring best practices"
            ],
            "answer": f"Understanding core principles of {topic}",
            "explanation": f"The primary focus should be on understanding the core principles that govern {topic}."
        },
        {
            "question": f"How should beginners approach learning {topic}?",
            "choices": [
                "Jump to advanced concepts immediately",
                "Start with fundamentals and build gradually",
                "Focus only on theoretical aspects",
                "Avoid hands-on practice"
            ],
            "answer": "Start with fundamentals and build gradually",
            "explanation": f"A systematic approach starting with fundamentals is most effective for learning {topic}."
        }
    ]

    return {
        "explanation": content,
        "quiz_questions": fallback_questions,
        "content_analysis": {},
        "word_count": len(content.split()),
        "ai_generated": False,
        "nlp_enhanced": False,
        "fallback_used": True,
        "topic": topic,
        "level": level,
        "learning_style": learning_style
    }
