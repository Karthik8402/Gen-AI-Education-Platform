from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
from collections import defaultdict
from functools import wraps
from datetime import datetime, timezone, timedelta
from pymongo import ReturnDocument
from time import time
import google.generativeai as genai
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
import json
import numpy as np
import pandas as pd
import logging
import re
import random
from services.nlp_processor import AdvancedEducationalNLP

# Advanced ML imports
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import pickle

# spaCy imports
import spacy
from spacy.matcher import Matcher, PhraseMatcher
import asyncio

from db import (
    users_col, courses_col, quizzes_col, attempts_col, events_col, profiles_col, templates_col, ensure_indexes
)

# Configure API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
# Allow any origin on /api/*, permit JSON headers and credentials
# Production-ready CORS configuration for Railway
def get_cors_origins():
    """Get allowed origins based on environment"""
    # Development origins
    dev_origins = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Production origins (you'll add these after deployment)
    prod_origins = [
        "https://karthik8402.github.io",  # GitHub Pages
        "https://your-frontend.netlify.app",  # Netlify (update with actual URL)
        "https://your-frontend.vercel.app",   # Vercel (update with actual URL)
    ]
    
    # Railway environment detection
    if os.environ.get('RAILWAY_ENVIRONMENT') == 'production':
        return dev_origins + prod_origins  # Allow both for testing
    else:
        return dev_origins
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
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

# ========================================
# ADVANCED ML PREDICTION SYSTEM
# ========================================
class AdvancedMLPredictor:
    """Advanced ML system using Random Forest for skill prediction"""
    
    def __init__(self):
        self.skill_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        self.performance_regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            min_samples_split=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.feature_names = [
            'avg_score', 'completion_rate', 'total_attempts', 'time_consistency',
            'improvement_trend', 'topic_diversity', 'difficulty_progression',
            'error_patterns', 'study_frequency', 'engagement_score'
        ]
        
    def extract_advanced_features(self, attempts, profile=None):
        """Extract comprehensive features from student data"""
        if not attempts:
            return np.array([0] * len(self.feature_names)).reshape(1, -1)
        
        # Calculate advanced metrics
        scores = [(a.get('score', {}).get('correct', 0) / max(a.get('score', {}).get('total', 1), 1)) 
                 for a in attempts]
        
        # Feature engineering
        features = {
            'avg_score': np.mean(scores) if scores else 0,
            'completion_rate': len([a for a in attempts if a.get('score', {}).get('correct', 0) > 0]) / max(len(attempts), 1),
            'total_attempts': len(attempts),
            'time_consistency': self._calculate_time_consistency(attempts),
            'improvement_trend': self._calculate_improvement_trend(scores),
            'topic_diversity': len(set(a.get('topic', 'unknown') for a in attempts)),
            'difficulty_progression': self._calculate_difficulty_progression(attempts),
            'error_patterns': self._analyze_error_patterns(attempts),
            'study_frequency': self._calculate_study_frequency(attempts),
            'engagement_score': self._calculate_engagement_score(attempts, profile)
        }
        
        return np.array([features[name] for name in self.feature_names]).reshape(1, -1)
    
    def _calculate_time_consistency(self, attempts):
        """Calculate consistency in study timing"""
        if len(attempts) < 2:
            return 0.5
        
        timestamps = [a.get('submitted_at') for a in attempts if a.get('submitted_at')]
        if len(timestamps) < 2:
            return 0.5
        
        # Calculate time gaps between attempts
        time_gaps = []
        for i in range(1, len(timestamps)):
            if hasattr(timestamps[i], 'timestamp') and hasattr(timestamps[i-1], 'timestamp'):
                gap = abs(timestamps[i].timestamp() - timestamps[i-1].timestamp()) / 3600  # hours
                time_gaps.append(gap)
        
        if not time_gaps:
            return 0.5
        
        # Consistency score based on variance in time gaps
        variance = np.var(time_gaps) if len(time_gaps) > 1 else 0
        return max(0, 1 - (variance / max(np.mean(time_gaps), 1)))
    
    def _calculate_improvement_trend(self, scores):
        """Calculate learning improvement trend"""
        if len(scores) < 3:
            return 0
        
        # Linear regression on scores over time
        x = np.arange(len(scores))
        trend = np.polyfit(x, scores, 1)[0] if len(scores) > 1 else 0
        return max(-1, min(1, trend))  # Normalize to [-1, 1]
    
    def _calculate_difficulty_progression(self, attempts):
        """Analyze progression through difficulty levels"""
        difficulty_map = {'beginner': 1, 'intermediate': 2, 'pro': 3, 'advanced': 3}
        
        difficulties = [difficulty_map.get(a.get('difficulty', 'beginner'), 1) for a in attempts]
        if len(difficulties) < 2:
            return 0.5
        
        # Check if student progresses to higher difficulties
        progression = np.mean([difficulties[i] >= difficulties[i-1] for i in range(1, len(difficulties))])
        return progression
    
    def _analyze_error_patterns(self, attempts):
        """Analyze common error patterns"""
        if not attempts:
            return 0.5
        
        error_rates = []
        for attempt in attempts:
            total = attempt.get('score', {}).get('total', 1)
            correct = attempt.get('score', {}).get('correct', 0)
            error_rate = (total - correct) / max(total, 1)
            error_rates.append(error_rate)
        
        # Lower error rate = better pattern recognition
        return 1 - np.mean(error_rates)
    
    def _calculate_study_frequency(self, attempts):
        """Calculate study frequency and regularity"""
        if len(attempts) < 2:
            return 0.5
        
        timestamps = [a.get('submitted_at') for a in attempts if a.get('submitted_at')]
        if len(timestamps) < 2:
            return 0.5
        
        # Calculate average time between study sessions
        total_time = 0
        for i in range(1, len(timestamps)):
            if hasattr(timestamps[i], 'timestamp') and hasattr(timestamps[i-1], 'timestamp'):
                total_time += timestamps[i].timestamp() - timestamps[i-1].timestamp()
        
        if total_time <= 0:
            return 0.5
        
        avg_gap_days = (total_time / (len(timestamps) - 1)) / 86400  # Convert to days
        
        # Optimal frequency is around 1-3 days
        if 1 <= avg_gap_days <= 3:
            return 1.0
        elif avg_gap_days < 1:
            return 0.8  # Too frequent
        elif avg_gap_days <= 7:
            return 0.6  # Weekly is ok
        else:
            return 0.3  # Too infrequent
    
    def _calculate_engagement_score(self, attempts, profile):
        """Calculate student engagement score"""
        if not attempts:
            return 0.5
        
        # Factors: attempt frequency, question completion, time spent
        engagement_factors = []
        
        # Completion rate
        completion_rate = len([a for a in attempts if a.get('score', {}).get('total', 0) > 0]) / len(attempts)
        engagement_factors.append(completion_rate)
        
        # Diversity in topics
        unique_topics = len(set(a.get('topic', 'unknown') for a in attempts))
        topic_diversity = min(1.0, unique_topics / 5)  # Normalize to max 5 topics
        engagement_factors.append(topic_diversity)
        
        # Recent activity (within last 7 days)
        recent_attempts = 0
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        for attempt in attempts:
            submitted_at = attempt.get('submitted_at')
            if submitted_at and hasattr(submitted_at, 'timestamp'):
                if datetime.fromtimestamp(submitted_at.timestamp(), tz=timezone.utc) > cutoff:
                    recent_attempts += 1
        
        recency_score = min(1.0, recent_attempts / 3)  # 3+ attempts in last week = high engagement
        engagement_factors.append(recency_score)
        
        return np.mean(engagement_factors)
    
    def train_model(self, training_data=None):
        """Train the Random Forest models"""
        if training_data is None:
            training_data = self._generate_synthetic_training_data()
        
        X = np.array([data['features'] for data in training_data])
        y_skill = [data['skill_level'] for data in training_data]
        y_performance = [data['performance_score'] for data in training_data]
        
        # Encode skill levels
        y_skill_encoded = self.label_encoder.fit_transform(y_skill)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train models
        self.skill_classifier.fit(X_scaled, y_skill_encoded)
        self.performance_regressor.fit(X_scaled, y_performance)
        
        self.is_trained = True
        logger.info("✅ Random Forest models trained successfully")
        
        return {
            'skill_accuracy': self.skill_classifier.score(X_scaled, y_skill_encoded),
            'performance_r2': self.performance_regressor.score(X_scaled, y_performance)
        }
    
    def predict_skill_level(self, attempts, profile=None):
        """Predict student skill level using Random Forest"""
        if not self.is_trained:
            self.train_model()
        
        features = self.extract_advanced_features(attempts, profile)
        features_scaled = self.scaler.transform(features)
        
        # Get prediction and confidence
        skill_proba = self.skill_classifier.predict_proba(features_scaled)[0]
        skill_prediction = self.skill_classifier.predict(features_scaled)[0]
        performance_score = self.performance_regressor.predict(features_scaled)[0]
        
        # Convert back to label
        skill_level = self.label_encoder.inverse_transform([skill_prediction])[0]
        confidence = np.max(skill_proba)
        
        # Feature importance for explainability
        feature_importance = dict(zip(self.feature_names, self.skill_classifier.feature_importances_))
        
        return {
            'predicted_level': skill_level,
            'confidence': float(confidence),
            'performance_score': float(performance_score),
            'feature_importance': feature_importance,
            'skill_probabilities': {
                level: float(prob) for level, prob in zip(
                    self.label_encoder.classes_, skill_proba
                )
            }
        }
    
    def _generate_synthetic_training_data(self):
        """Generate synthetic training data for model initialization"""
        training_data = []
        
        # Generate samples for each skill level
        for skill_level in ['beginner', 'intermediate', 'pro']:
            for i in range(100):  # 100 samples per level
                if skill_level == 'beginner':
                    features = [
                        np.random.normal(0.4, 0.15),  # avg_score
                        np.random.normal(0.6, 0.2),   # completion_rate
                        np.random.randint(1, 10),     # total_attempts
                        np.random.uniform(0.3, 0.7),  # time_consistency
                        np.random.normal(-0.1, 0.2),  # improvement_trend
                        np.random.randint(1, 3),      # topic_diversity
                        np.random.uniform(0.2, 0.5),  # difficulty_progression
                        np.random.uniform(0.3, 0.6),  # error_patterns
                        np.random.uniform(0.4, 0.7),  # study_frequency
                        np.random.uniform(0.3, 0.6)   # engagement_score
                    ]
                    performance = np.random.normal(45, 10)
                
                elif skill_level == 'intermediate':
                    features = [
                        np.random.normal(0.7, 0.1),   # avg_score
                        np.random.normal(0.8, 0.1),   # completion_rate
                        np.random.randint(8, 25),     # total_attempts
                        np.random.uniform(0.5, 0.8),  # time_consistency
                        np.random.normal(0.1, 0.15),  # improvement_trend
                        np.random.randint(2, 5),      # topic_diversity
                        np.random.uniform(0.5, 0.8),  # difficulty_progression
                        np.random.uniform(0.6, 0.8),  # error_patterns
                        np.random.uniform(0.6, 0.9),  # study_frequency
                        np.random.uniform(0.6, 0.8)   # engagement_score
                    ]
                    performance = np.random.normal(75, 8)
                
                else:  # pro
                    features = [
                        np.random.normal(0.9, 0.05),  # avg_score
                        np.random.normal(0.95, 0.05), # completion_rate
                        np.random.randint(20, 50),    # total_attempts
                        np.random.uniform(0.7, 0.95), # time_consistency
                        np.random.normal(0.2, 0.1),   # improvement_trend
                        np.random.randint(4, 8),      # topic_diversity
                        np.random.uniform(0.8, 1.0),  # difficulty_progression
                        np.random.uniform(0.8, 0.95), # error_patterns
                        np.random.uniform(0.8, 1.0),  # study_frequency
                        np.random.uniform(0.8, 0.95)  # engagement_score
                    ]
                    performance = np.random.normal(92, 5)
                
                # Ensure values are in valid ranges
                features = [max(0, min(1, f)) if i < 7 else f for i, f in enumerate(features)]
                performance = max(0, min(100, performance))
                
                training_data.append({
                    'features': features,
                    'skill_level': skill_level,
                    'performance_score': performance
                })
        
        return training_data
    
    def get_learning_recommendations(self, prediction_result, attempts):
        """Generate personalized learning recommendations"""
        skill_level = prediction_result['predicted_level']
        feature_importance = prediction_result['feature_importance']
        
        recommendations = []
        
        # Base recommendations by skill level
        base_recs = {
            'beginner': [
                "Focus on building solid fundamentals",
                "Practice with guided examples and tutorials",
                "Start with basic concepts before advancing",
                "Take your time to understand core principles"
            ],
            'intermediate': [
                "Work on more complex problem-solving scenarios",
                "Apply concepts to real-world projects",
                "Study advanced algorithms and data structures",
                "Practice system design and architecture"
            ],
            'pro': [
                "Tackle cutting-edge research problems",
                "Contribute to open-source projects",
                "Mentor other students",
                "Explore emerging technologies and trends"
            ]
        }
        
        recommendations.extend(base_recs.get(skill_level, base_recs['beginner']))
        
        # Add personalized recommendations based on feature importance
        if feature_importance['improvement_trend'] > 0.2 and prediction_result.get('performance_score', 0) < 70:
            recommendations.append("Focus on consistent daily practice to maintain learning momentum")
        
        if feature_importance['time_consistency'] > 0.15:
            recommendations.append("Establish a regular study schedule for better learning outcomes")
        
        if feature_importance['topic_diversity'] > 0.1 and len(set(a.get('topic') for a in attempts)) < 3:
            recommendations.append("Explore different topics to broaden your knowledge base")
        
        return recommendations[:5]  # Return top 5 recommendations

# Initialize ML Predictor
ml_predictor = AdvancedMLPredictor()

# ========================================
# ADVANCED NLP CONTENT PROCESSOR
# ========================================
class AdvancedNLPProcessor:
    """Advanced NLP processor using spaCy for content analysis and generation"""
    
    def __init__(self, nlp_model=None):
        self.nlp = nlp_model
        self.matcher = Matcher(nlp_model.vocab) if nlp_model else None
        self.phrase_matcher = PhraseMatcher(nlp_model.vocab) if nlp_model else None
        self._setup_patterns()
        
    def _setup_patterns(self):
        """Setup spaCy patterns for educational content analysis"""
        if not self.nlp or not self.matcher:
            return
        
        # Educational concept patterns
        concept_patterns = [
            [{"LOWER": {"IN": ["concept", "principle", "theory", "method"]}},
             {"LOWER": "of"},
             {"IS_ALPHA": True}],
            [{"LOWER": "how"}, {"LOWER": "to"}, {"IS_ALPHA": True}],
            [{"LOWER": {"IN": ["definition", "meaning"]}},
             {"LOWER": {"IN": ["of", "for"]}},
             {"IS_ALPHA": True}]
        ]
        
        # Process patterns
        process_patterns = [
            [{"LOWER": {"IN": ["step", "phase", "stage"]}},
             {"IS_DIGIT": True}],
            [{"LOWER": {"IN": ["first", "second", "third", "next", "then", "finally"]}},
             {"POS": "PUNCT", "OP": "?"},
             {"IS_ALPHA": True}]
        ]
        
        # Add patterns to matcher
        self.matcher.add("EDUCATIONAL_CONCEPTS", concept_patterns)
        self.matcher.add("PROCESS_STEPS", process_patterns)
    
    def analyze_content_structure(self, text):
        """Analyze educational content structure using spaCy"""
        if not self.nlp:
            return self._basic_structure_analysis(text)
        
        doc = self.nlp(text)
        
        analysis = {
            'sentences': len(list(doc.sents)),
            'complexity_score': self._calculate_readability(doc),
            'key_concepts': self._extract_concepts(doc),
            'process_steps': self._extract_processes(doc),
            'entities': self._extract_educational_entities(doc),
            'topics': self._identify_topics(doc),
            'difficulty_indicators': self._assess_difficulty(doc)
        }
        
        return analysis
    
    def _calculate_readability(self, doc):
        """Calculate content readability score"""
        if not doc.sents:
            return 0.5
        
        # Flesch-Kincaid inspired scoring
        sentences = list(doc.sents)
        words = [token for token in doc if token.is_alpha]
        syllables = sum(self._count_syllables(token.text) for token in words)
        
        if not sentences or not words:
            return 0.5
        
        avg_sentence_length = len(words) / len(sentences)
        avg_syllables_per_word = syllables / len(words) if words else 0
        
        # Simplified readability score (0-1 scale)
        score = 1 - min(1, (avg_sentence_length / 20 + avg_syllables_per_word / 3) / 2)
        return max(0, score)
    
    def _count_syllables(self, word):
        """Estimate syllable count in a word"""
        word = word.lower()
        vowels = "aeiouy"
        syllables = 0
        prev_was_vowel = False
        
        for char in word:
            if char in vowels:
                if not prev_was_vowel:
                    syllables += 1
                prev_was_vowel = True
            else:
                prev_was_vowel = False
        
        if word.endswith('e'):
            syllables -= 1
        
        return max(1, syllables)
    
    def _extract_concepts(self, doc):
        """Extract educational concepts using spaCy patterns"""
        matches = self.matcher(doc) if self.matcher else []
        concepts = []
        
        for match_id, start, end in matches:
            label = self.nlp.vocab.strings[match_id]
            if label == "EDUCATIONAL_CONCEPTS":
                concept_span = doc[start:end]
                concepts.append({
                    'text': concept_span.text,
                    'start': start,
                    'end': end,
                    'type': 'concept'
                })
        
        # Also extract noun chunks as potential concepts
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) > 1 and len(chunk.text) > 5:
                concepts.append({
                    'text': chunk.text,
                    'start': chunk.start,
                    'end': chunk.end,
                    'type': 'noun_phrase'
                })
        
        return concepts[:10]  # Return top 10
    
    def _extract_processes(self, doc):
        """Extract process steps and procedures"""
        matches = self.matcher(doc) if self.matcher else []
        processes = []
        
        for match_id, start, end in matches:
            label = self.nlp.vocab.strings[match_id]
            if label == "PROCESS_STEPS":
                step_span = doc[start:end]
                processes.append({
                    'text': step_span.text,
                    'start': start,
                    'end': end,
                    'type': 'process_step'
                })
        
        return processes
    
    def _extract_educational_entities(self, doc):
        """Extract educational entities (organizations, technologies, etc.)"""
        entities = []
        
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "TECH", "PERSON", "GPE"]:
                entities.append({
                    'text': ent.text,
                    'label': ent.label_,
                    'start': ent.start,
                    'end': ent.end
                })
        
        return entities
    
    def _identify_topics(self, doc):
        """Identify main topics in the content"""
        # Extract most frequent noun phrases
        noun_phrases = [chunk.text.lower() for chunk in doc.noun_chunks 
                       if len(chunk.text.split()) <= 3 and chunk.text.isalnum()]
        
        # Count frequency
        topic_counts = {}
        for phrase in noun_phrases:
            topic_counts[phrase] = topic_counts.get(phrase, 0) + 1
        
        # Return top topics
        topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{'topic': topic, 'frequency': count} for topic, count in topics]
    
    def _assess_difficulty(self, doc):
        """Assess content difficulty indicators"""
        indicators = {
            'technical_terms': 0,
            'complex_sentences': 0,
            'abstract_concepts': 0,
            'jargon_level': 0
        }
        
        # Count technical terms (longer words, proper nouns)
        technical_words = [token for token in doc 
                          if token.is_alpha and len(token.text) > 8]
        indicators['technical_terms'] = len(technical_words)
        
        # Count complex sentences (longer than 20 words)
        sentences = list(doc.sents)
        complex_sents = [sent for sent in sentences if len(sent) > 20]
        indicators['complex_sentences'] = len(complex_sents)
        
        # Abstract concepts (words ending in -tion, -ism, -ness)
        abstract_endings = ['-tion', '-ism', '-ness', '-ity', '-ance', '-ence']
        abstract_words = [token for token in doc 
                         if any(token.text.lower().endswith(ending) for ending in abstract_endings)]
        indicators['abstract_concepts'] = len(abstract_words)
        
        return indicators
    
    def _basic_structure_analysis(self, text):
        """Basic analysis when spaCy is not available"""
        sentences = text.split('.')
        words = text.split()
        
        return {
            'sentences': len(sentences),
            'complexity_score': min(1, len(words) / len(sentences) / 20) if sentences else 0,
            'key_concepts': [],
            'process_steps': [],
            'entities': [],
            'topics': [],
            'difficulty_indicators': {}
        }
    
    def enhance_content_for_learning_style(self, content, learning_style, difficulty):
        """Enhance content based on learning style using NLP analysis"""
        if not self.nlp:
            return self._basic_content_enhancement(content, learning_style, difficulty)
        
        doc = self.nlp(content)
        analysis = self.analyze_content_structure(content)
        
        enhanced_content = content
        
        # Style-specific enhancements
        if learning_style == "visual":
            enhanced_content = self._add_visual_elements(enhanced_content, analysis)
        elif learning_style == "auditory":
            enhanced_content = self._add_auditory_elements(enhanced_content, analysis)
        elif learning_style == "kinesthetic":
            enhanced_content = self._add_kinesthetic_elements(enhanced_content, analysis)
        elif learning_style == "reading":
            enhanced_content = self._add_reading_elements(enhanced_content, analysis)
        
        # Difficulty adjustments
        if difficulty == "beginner":
            enhanced_content = self._simplify_content(enhanced_content, doc)
        elif difficulty == "pro":
            enhanced_content = self._add_technical_depth(enhanced_content, analysis)
        
        return enhanced_content
    
    def _add_visual_elements(self, content, analysis):
        """Add visual learning elements"""
        visual_markers = ["🎯", "📊", "🔍", "💡", "⚡", "📈", "🔧", "🏗️"]
        
        # Add visual markers to key concepts
        for i, concept in enumerate(analysis.get('key_concepts', [])[:4]):
            if i < len(visual_markers):
                concept_text = concept['text']
                marker = visual_markers[i]
                content = content.replace(
                    concept_text, 
                    f"{marker} **{concept_text}**", 
                    1
                )
        
        return content
    
    def _add_auditory_elements(self, content, analysis):
        """Add auditory learning elements"""
        # Add discussion prompts and conversational elements
        auditory_phrases = [
            "Let's discuss this concept:",
            "Think about this:",
            "Consider the following:",
            "Here's an important point:"
        ]
        
        paragraphs = content.split('\n\n')
        enhanced_paragraphs = []
        
        for i, paragraph in enumerate(paragraphs):
            if len(paragraph) > 100 and i < len(auditory_phrases):
                enhanced_paragraphs.append(f"{auditory_phrases[i]} {paragraph}")
            else:
                enhanced_paragraphs.append(paragraph)
        
        return '\n\n'.join(enhanced_paragraphs)
    
    def _add_kinesthetic_elements(self, content, analysis):
        """Add kinesthetic learning elements"""
        # Add hands-on activities and action-oriented language
        kinesthetic_markers = [
            "## Hands-On Activity",
            "## Try This Exercise", 
            "## Practice Implementation",
            "## Build This Example"
        ]
        
        # Replace passive language with active language
        active_replacements = {
            " understand ": " practice ",
            " learn ": " build ",
            " study ": " experiment with ",
            " read about ": " work with "
        }
        
        enhanced_content = content
        for passive, active in active_replacements.items():
            enhanced_content = enhanced_content.replace(passive, active)
        
        return enhanced_content
    
    def _add_reading_elements(self, content, analysis):
        """Add reading/writing learning elements"""
        # Add detailed explanations and structured content
        reading_structure = [
            "## Detailed Analysis",
            "## Comprehensive Overview",
            "## Technical Specification",
            "## Reference Documentation"
        ]
        
        # Ensure content has proper structure
        if not content.startswith('#'):
            structured_content = f"# Overview\n\n{content}"
        else:
            structured_content = content
        
        return structured_content
    
    def _simplify_content(self, content, doc):
        """Simplify content for beginners"""
        # Replace complex words with simpler alternatives
        simplifications = {
            "utilize": "use",
            "implement": "create",
            "methodology": "method",
            "subsequently": "then",
            "demonstrate": "show",
            "facilitate": "help",
            "optimize": "improve"
        }
        
        simplified_content = content
        for complex_word, simple_word in simplifications.items():
            simplified_content = simplified_content.replace(complex_word, simple_word)
        
        return simplified_content
    
    def _add_technical_depth(self, content, analysis):
        """Add technical depth for advanced learners"""
        # Add technical considerations and advanced concepts
        technical_addition = """

## Advanced Considerations

For expert-level implementation, consider these technical aspects:
- Performance optimization and scalability factors
- Security implications and best practices
- Integration patterns and architectural considerations
- Error handling and edge case management
"""
        
        return content + technical_addition
    
    def _basic_content_enhancement(self, content, learning_style, difficulty):
        """Basic content enhancement when spaCy is unavailable"""
        # Simple text-based enhancements
        if learning_style == "visual":
            content = "🎯 **Key Concepts**: " + content
        elif learning_style == "kinesthetic":
            content = "⚡ **Hands-On Learning**: " + content
        
        return content

# Initialize NLP Processor
nlp_processor = AdvancedNLPProcessor(nlp)

# ========================================
# AUTHENTICATION FUNCTIONS
# ========================================
def validate_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_required_fields(data, required_fields):
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400
    return None

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
                    logger.warning(f"User {payload.get('email')} with role '{user_role}' attempted to access endpoint requiring {allowed_roles}")
                    return {"error": f"Access denied. Required role: {' or '.join(allowed_roles)}"}, 403
                
                return f(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                return {"error": "Token has expired"}, 401
            except jwt.InvalidTokenError:
                return {"error": "Invalid token"}, 401
                
        return wrapper
    return decorator

# Rate limiting
request_counts = defaultdict(list)

def rate_limit(max_requests=10, window=60):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user_id = getattr(request, 'user', {}).get('uid', request.remote_addr)
            now = time()
            
            request_counts[user_id] = [req_time for req_time in request_counts[user_id] 
                                     if now - req_time < window]
            
            if len(request_counts[user_id]) >= max_requests:
                return {"error": "Rate limit exceeded"}, 429
                
            request_counts[user_id].append(now)
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Quiz validation
def validate_quiz_params(body):
    errors = []
    questions = body.get("questions", 0)
    
    if questions > 50:
        errors.append("Maximum 50 questions allowed")
    if questions < 1:
        errors.append("At least 1 question required")
    return errors

# ========================================
# AUTHENTICATION ENDPOINTS
# ========================================
@app.post("/api/auth/signup")
def signup():
    body = request.get_json(force=True)
    email = body.get("email","").lower().strip()
    username = body.get("username","").strip()
    password = body.get("password","")
    
    if not email or not password:
        return {"error": "Email and password required"}, 400
    
    if users_col.find_one({"email": email}):
        return {"error": "Email already registered"}, 409
    
    doc = {
        "email": email,
        "username": username or email.split("@")[0],
        "password_hash": generate_password_hash(password),
        "role": "student",
        "created_at": datetime.now(timezone.utc),
    }
    
    res = users_col.insert_one(doc)
    token = create_token(res.inserted_id, email, doc["role"])
    
    return {"token": token, "user": {"email": email, "username": doc["username"], "role": doc["role"]}}

@app.post("/api/auth/login")
def login():
    body = request.get_json(force=True)
    email = body.get("email","").lower().strip()
    password = body.get("password","")
    
    user = users_col.find_one({"email": email})
    
    if not user or not check_password_hash(user.get("password_hash",""), password):
        return {"error": "Invalid credentials"}, 401
    
    token = create_token(user["_id"], email, user.get("role","student"))
    return {"token": token, "user": {"email": email, "username": user.get("username"), "role": user.get("role","student")}}

@app.route("/api/auth/me", methods=["GET"])
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
        "user": request.user,
        "stats": {
            "quizzesCreated": quiz_count,
            "attemptsCompleted": attempt_count,
            "memberSince": user_doc.get("created_at").isoformat() + "Z",
            "skillLevel": skill_level
        }
    }

# ========================================
# STUDENT PROFILE ENDPOINTS
# ========================================
@app.post("/api/student/profile")
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
                # ✅ Import ReturnDocument at top of file: from pymongo import ReturnDocument
                result = profiles_col.find_one_and_update(
                    {"studentId": user_id},
                    {"$set": profile_doc},
                    return_document=ReturnDocument.AFTER  # ✅ Correct PyMongo syntax
                )
                message = "Profile updated successfully"
            except (TypeError, NameError):
                # ✅ Fallback for mock database or missing import
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
                # ✅ Fallback for mock database
                if hasattr(profiles_col, '_data'):
                    profile_doc["_id"] = f"profile_{user_id}"
                    profiles_col._data.append(profile_doc)
                    result = profile_doc
                    message = "Profile created successfully"
                else:
                    raise db_error
        
        # ✅ Return response that matches frontend expectations
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

@app.route("/api/student/profile/me", methods=["GET"])
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
                
        except Exception as attempts_error:
            logger.warning(f"Could not fetch attempts: {attempts_error}")
            recent_attempts = []
        
        # ✅ Extract saved profile data
        profile_info = profile.get('profile', {})
        demographics = profile.get('demographics', {})
        cognitive_profile = profile.get('cognitiveProfile', {})
        performance_metrics = profile.get('performanceMetrics', {})
        
        # ✅ CRITICAL FIX: Prioritize placement quiz result over dynamic calculation
        placement_completed = profile_info.get('placementCompleted', False)
        saved_skill_level = profile_info.get('skillLevel', 'beginner')
        saved_skill_confidence = profile_info.get('skillConfidence', 0.5)
        
        # Calculate current performance metrics (but don't override skill level)
        current_avg_score = 0.0
        performance_based_level = "beginner"
        
        if recent_attempts and len(recent_attempts) > 0:
            try:
                recent_scores = []
                for attempt in recent_attempts:
                    score_data = attempt.get('score', {})
                    correct = score_data.get('correct', 0)
                    total = max(score_data.get('total', 1), 1)
                    recent_scores.append(correct / total)
                
                if recent_scores:
                    current_avg_score = sum(recent_scores) / len(recent_scores)
                    performance_based_level = determine_skill_level(current_avg_score, len(recent_scores))
                        
            except Exception as calc_error:
                logger.warning(f"Error calculating metrics: {calc_error}")
        
        # ✅ DECISION LOGIC: Use placement result if completed, otherwise use performance-based
        if placement_completed and saved_skill_level:
            # Use placement quiz result as primary skill level
            final_skill_level = saved_skill_level
            final_skill_confidence = saved_skill_confidence
            print(f"🎯 Using placement quiz result: {final_skill_level}")
        else:
            # Use performance-based calculation for users who haven't done placement
            final_skill_level = performance_based_level
            final_skill_confidence = calculate_confidence(recent_scores) if 'recent_scores' in locals() and recent_scores else 0.5
            print(f"📊 Using performance-based result: {final_skill_level}")
            
            # ✅ Update profile with performance-based skill level (only if no placement)
            try:
                if hasattr(profiles_col, 'update_one') and not placement_completed:
                    profiles_col.update_one(
                        {"studentId": user_id},
                        {
                            "$set": {
                                "profile.skillLevel": final_skill_level,
                                "profile.skillConfidence": final_skill_confidence,
                                "profile.lastSkillUpdate": datetime.now(timezone.utc).isoformat(),
                                "updated_at": datetime.now(timezone.utc).isoformat()
                            }
                        }
                    )
            except Exception as update_error:
                logger.warning(f"Could not update profile: {update_error}")
        
        return {
            "status": "success",
            "profile": {
                "user_id": profile.get('studentId'),
                "name": profile_info.get('name', demographics.get('name', 'User')),
                "age": demographics.get('age', 0),
                "department": demographics.get('department', 'General'),
                "learning_style": cognitive_profile.get('learningStyle', 'visual'),
                "education_level": demographics.get('educationLevel', 'undergraduate'),
                
                # ✅ Use final determined skill level (respects placement quiz)
                "current_skill_level": final_skill_level,
                "skill_confidence": final_skill_confidence,
                "last_skill_update": profile_info.get('lastSkillUpdate'),
                "placement_completed": placement_completed,  # ✅ Include placement status
                "placement_score": profile_info.get('placementScore'),  # ✅ Include placement score
                
                # Performance metrics
                "total_quizzes": len(recent_attempts),
                "avg_score": current_avg_score * 100,  # Convert to percentage
                "learning_streak": performance_metrics.get('streakDays', 0),
                
                # Learning insights
                "strengths": profile_info.get('strengths', []),
                "improvement_areas": profile_info.get('improvement_areas', []),
                "preferred_topics": profile_info.get('preferred_topics', []),
                
                "created_at": profile.get('created_at'),
                "updated_at": profile.get('updated_at'),
                "isNewUser": False
            }
        }, 200
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return {"error": f"Failed to load profile: {str(e)}"}, 500

# ✅ Helper functions with better error handling
def determine_skill_level(avg_score, num_attempts):
    """Determine skill level based on performance"""
    try:
        if num_attempts < 3:
            return 'beginner'
        
        if avg_score >= 0.8:
            return 'expert'
        elif avg_score >= 0.6:
            return 'intermediate' 
        else:
            return 'beginner'
    except:
        return 'beginner'

def calculate_confidence(scores):
    """Calculate confidence in skill assessment"""
    try:
        if len(scores) < 2:
            return 0.5
        
        mean_score = sum(scores) / len(scores)
        variance = sum((s - mean_score) ** 2 for s in scores) / len(scores)
        confidence = max(0.1, min(0.95, 1 - variance))
        return round(confidence, 2)
    except:
        return 0.5


@app.get("/api/student/profile/<student_id>")
@auth_required
def get_student_profile(student_id):
    """Get detailed student profile"""
    try:
        current_user_id = request.user["uid"]
        
        if current_user_id != student_id and request.user.get("role") not in ["teacher", "admin"]:
            return {"error": "Access denied"}, 403
        
        profile = None
        if hasattr(profiles_col, '_data'):
            for doc in profiles_col._data:
                if doc.get("studentId") == student_id:
                    profile = doc
                    break
        else:
            profile = profiles_col.find_one({"studentId": student_id})
        
        if not profile:
            return {"error": "Profile not found. Create profile first using 'Create Student Profile' request."}, 404
        
        if '_id' in profile:
            profile['_id'] = str(profile['_id'])
        
        return {"status": "success", "profile": profile}
        
    except Exception as e:
        logger.error(f"Error in get_student_profile: {str(e)}")
        return {"error": str(e)}, 500

@app.post("/api/student/predict-level")
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

# ========================================
# QUIZ ENDPOINTS
# ========================================
@app.post("/api/quiz/placement")
@auth_required
def generate_placement_quiz():
    """Generate adaptive placement quiz for skill level prediction"""
    body = request.get_json(force=True)
    user_id = request.user["uid"]
    
    department = body.get("department", "General")
    interests = body.get("interests", [])
    question_count = int(body.get("questionCount", 8))
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        interests_text = ", ".join(interests) if interests else "general topics"
        
        prompt = f"""Create a placement assessment quiz for {department} field with focus on {interests_text}.

Generate exactly {question_count} questions with mixed difficulty:
- 2-3 beginner level questions (basic concepts)
- 3-4 intermediate level questions (applied knowledge) 
- 2-3 advanced level questions (complex analysis)

Each question MUST be multiple-choice with exactly 4 options.

Return ONLY valid JSON:
{{
  "questions": [
    {{ 
      "question": "What is [specific concept] in {department}?", 
      "choices": ["Option A", "Option B", "Option C", "Option D"], 
      "answer": "Option A",
      "difficulty": "beginner",
      "topic": "specific_topic",
      "type": "multiple-choice"
    }}
  ]
}}"""
        
        response = model.generate_content(prompt)
        ai_content = response.text.strip()
        start = ai_content.find("{")
        end = ai_content.rfind("}")
        
        if start != -1 and end != -1:
            quiz_data = json.loads(ai_content[start:end+1])
            questions = quiz_data.get("questions", [])
            
            # Validate questions
            validated_questions = []
            for question in questions:
                if (question.get("question") and 
                    len(question.get("choices", [])) == 4 and 
                    question.get("answer") and
                    question.get("answer") in question.get("choices", [])):
                    validated_questions.append(question)
            
            if len(validated_questions) >= question_count:
                return {"questions": validated_questions[:question_count]}
        
    except Exception as e:
        logger.error(f"AI placement quiz generation failed: {e}")
    
    # Fallback questions
    fallback_questions = [
        {
            "question": f"What is your current level of expertise in {department}?",
            "choices": ["Complete beginner", "Some basic knowledge", "Intermediate understanding", "Advanced expertise"],
            "answer": "Some basic knowledge",
            "difficulty": "self-assessment",
            "topic": "skill-level",
            "type": "self-assessment"
        },
        {
            "question": "How do you prefer to learn new concepts?",
            "choices": ["Step-by-step with examples", "Reading comprehensive theory first", "Hands-on practice immediately", "Group discussions and explanations"],
            "answer": "Step-by-step with examples",
            "difficulty": "self-assessment", 
            "topic": "learning-style",
            "type": "learning-preference"
        },
        {
            "question": f"Which aspect of {department} interests you most?",
            "choices": ["Fundamental principles and theory", "Practical applications and projects", "Advanced research and innovation", "Problem-solving and troubleshooting"],
            "answer": "Practical applications and projects",
            "difficulty": "beginner",
            "topic": "interests",
            "type": "preference"
        }
    ]
    
    return {"questions": fallback_questions[:question_count]}

@app.post("/api/quiz/placement/submit")
@auth_required  
def submit_placement_quiz():
    """Submit placement quiz and predict initial skill level"""
    body = request.get_json(force=True)
    user_id = request.user["uid"]
    
    answers = body.get("answers", [])
    department = body.get("department", "General")
    
    # Enhanced scoring logic
    total_questions = len(answers)
    correct_count = 0
    difficulty_score = 0
    
    # Calculate score based on answers
    for answer in answers:
        question = answer.get("question", {})
        user_answer = answer.get("selectedAnswer", "")
        correct_answer = question.get("answer", "")
        difficulty = question.get("difficulty", "beginner")
        
        if user_answer == correct_answer:
            correct_count += 1
            # Weight by difficulty
            if difficulty == "beginner":
                difficulty_score += 1
            elif difficulty == "intermediate":
                difficulty_score += 2
            elif difficulty == "advanced":
                difficulty_score += 3
    
    # Determine skill level based on performance
    accuracy = correct_count / max(total_questions, 1)
    avg_difficulty_score = difficulty_score / max(total_questions, 1)
    
    if accuracy >= 0.8 and avg_difficulty_score >= 2.5:
        predicted_level = "expert"
        confidence = 0.9
    elif accuracy >= 0.6 and avg_difficulty_score >= 1.5:
        predicted_level = "intermediate" 
        confidence = 0.8
    else:
        predicted_level = "beginner"
        confidence = 0.7
    
    # **CRITICAL FIX: Save to user profile**
    try:
        current_time = datetime.now(timezone.utc)
        
        # Update or create profile with placement result
        profile_update = {
            "studentId": user_id,
            "profile": {
                "skillLevel": predicted_level,  # ✅ Save the predicted level
                "skillConfidence": confidence,
                "lastSkillUpdate": current_time.isoformat(),
                "placementCompleted": True,
                "placementScore": accuracy,
                "placementDate": current_time.isoformat()
            },
            "demographics": {
                "department": department
            },
            "performanceMetrics": {
                "averageScore": accuracy * 100,
                "totalAttempts": 1,
                "placementAttempts": 1
            },
            "updated_at": current_time,
            "created_at": current_time
        }
        
        # Try to update existing profile first
        existing_profile = profiles_col.find_one({"studentId": user_id})
        
        if existing_profile:
            # Update existing profile
            profiles_col.update_one(
                {"studentId": user_id},
                {"$set": {
                    "profile.skillLevel": predicted_level,
                    "profile.skillConfidence": confidence,
                    "profile.lastSkillUpdate": current_time.isoformat(),
                    "profile.placementCompleted": True,
                    "profile.placementScore": accuracy,
                    "performanceMetrics.averageScore": accuracy * 100,
                    "updated_at": current_time
                }},
                upsert=True
            )
        else:
            # Create new profile
            profiles_col.insert_one(profile_update)
            
        print(f"✅ Profile updated: User {user_id} skill level set to {predicted_level}")
        
    except Exception as e:
        print(f"❌ Failed to update profile: {e}")
        logger.error(f"Profile update failed: {e}")
    
    # Generate recommendations
    prediction_result = {
        'predicted_level': predicted_level,
        'confidence': confidence,
        'performance_score': accuracy * 100,
        'feature_importance': {k: 0.0 for k in getattr(ml_predictor, 'feature_names', [])}
    }
    
    try:
        recommendations = ml_predictor.get_learning_recommendations(prediction_result, [])
    except:
        recommendations = [
            f"Start with {predicted_level}-level content to match your skill assessment",
            f"Focus on {department} topics based on your interests",
            "Take regular quizzes to track your progress"
        ]
    
    return {
        "predictedLevel": predicted_level,
        "confidence": confidence,
        "accuracy": accuracy,
        "totalQuestions": total_questions,
        "correctAnswers": correct_count,
        "recommendations": recommendations,
        "profileUpdated": True 
    }

@app.route("/api/quiz/generate", methods=["POST"])
@auth_required  
def quiz_generate():
    body = request.get_json(force=True)
    print(f"🔍 Request body: {body}")
    
    # Validation
    errors = validate_quiz_params(body)
    if errors:
        print(f"❌ Validation errors: {errors}")
        return {"error": errors}, 400

    # Extract parameters
    main_topic = body.get("mainTopic", "General Knowledge")
    sub_topic = body.get("subTopic", "")
    custom_topic = body.get("customTopic", "")
    category = body.get("category", "Education")
    
    # Construct final topic
    if custom_topic:
        topic = custom_topic
    elif sub_topic and main_topic:
        topic = f"{main_topic} - {sub_topic}"
    else:
        topic = main_topic

    questions = int(body.get("questions", 5))
    choices = int(body.get("choices", 4))
    difficulty = body.get("difficulty", "beginner")
    language = body.get("language", "English")
    
    # Get user's profile for personalization
    user_id = request.user["uid"]
    try:
        profile = profiles_col.find_one({"studentId": user_id})
        if profile:
            # Read from the updated profile structure
            skill_level = profile.get('profile', {}).get('skillLevel', 'beginner')
            print(f"🎯 Using profile skill level: {skill_level}")
        else:
            skill_level = 'beginner'
            print(f"⚠️ No profile found, defaulting to: {skill_level}")
    except Exception as e:
        print(f"⚠️ Could not get user profile: {e}")
        skill_level = 'beginner'
    
    # Use skill_level in difficulty if not specified
    if not body.get("difficulty"):
        difficulty = skill_level  # ✅ Use profile skill level as default
    else:
        difficulty = body.get("difficulty", skill_level)
    
    # Generate with AI
    try:
        print("🔄 Starting AI generation...")
        
        # ✅ FIXED: Remove invalid parameter and use correct configuration
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        model = genai.GenerativeModel(
            'gemini-1.5-flash',
            generation_config=generation_config
        )
        print(f"📝 Generating {questions} {difficulty} questions on: {topic}")
        
        # Enhanced prompt with JSON formatting instructions
        prompt = f"""
Create a multiple-choice quiz on the topic: "{topic}"

Requirements:
- Category: {category}
- Language: {language}
- Difficulty Level: {difficulty}
- Exactly {questions} questions at {difficulty} difficulty level
- Exactly {choices} choices per question
- Cover a range of {difficulty} concepts relevant for someone at this skill level
- Ensure one clearly correct answer per question
- Provide a brief explanation for each correct answer

--- Difficulty Guidelines ---
If difficulty is 'beginner':
- Make questions slightly challenging (not too simple), test real understanding of key principles
- Include application scenarios requiring basic reasoning

If difficulty is 'intermediate':
- Focus on questions requiring multi-step logic, applied knowledge, or minor synthesis of concepts
- Include real-world scenarios or cross-topic connections

If difficulty is 'pro':
- Make the quiz hard: Each question should demand higher-order reasoning, deep domain insight, or critical thinking
- Use case studies, code analysis, theoretical what-if scenarios, or questions with plausible distractors
- Ask about nuance, deeper implications, or exceptions

IMPORTANT: Return ONLY valid JSON with no additional text, markdown, or formatting. Use this exact structure:

{{
  "topic": "{topic}",
  "category": "{category}", 
  "difficulty": "{difficulty}",
  "questions": [
    {{ 
      "question": "string", 
      "choices": ["choice1", "choice2", "choice3", "choice4"], 
      "answer": "correct_choice",
      "explanation": "brief explanation of why this is correct"
    }}
  ]
}}
"""
        
        print("🤖 Calling Gemini API...")
        response = model.generate_content(prompt)
        print(f"📥 AI Response received: {response.text[:100]}...")
        
        # ✅ FIXED: Better JSON parsing with cleanup
        ai_content = response.text.strip()
        
        # Remove any markdown formatting if present
        if ai_content.startswith('``` json'):
            ai_content = ai_content.replace('```json', '').replace('``` ', '')
        elif ai_content.startswith('```'):
            ai_content = ai_content.replace('``` ', '')
        
        # Find JSON boundaries
        start = ai_content.find("{")
        end = ai_content.rfind("}") + 1
        
        if start == -1 or end == 0:
            raise ValueError("No valid JSON found in AI response")
        
        json_content = ai_content[start:end]
        print(f"🔍 Cleaned JSON content: {json_content[:200]}...")
        
        # Parse JSON
        ai_quiz = json.loads(json_content)
        print(f"✅ Successfully parsed AI response")

        if "questions" not in ai_quiz or not isinstance(ai_quiz["questions"], list):
            raise ValueError("Invalid quiz structure: missing 'questions' array")

        # Validate questions
        validated = []
        for i, q in enumerate(ai_quiz.get("questions", [])):
            try:
                if (
                    q.get("question") and 
                    isinstance(q.get("choices"), list) and
                    len(q["choices"]) == choices and
                    q.get("answer") and 
                    q["answer"] in q["choices"] and
                    q.get("explanation")
                ):
                    # Clean up question data
                    validated_q = {
                        "question": str(q["question"]).strip(),
                        "choices": [str(c).strip() for c in q["choices"]],
                        "answer": str(q["answer"]).strip(),
                        "explanation": str(q["explanation"]).strip()
                    }
                    validated.append(validated_q)
                    print(f"✅ Question {i+1} validated")
                else:
                    print(f"❌ Question {i+1} failed validation: missing required fields")
            except Exception as qe:
                print(f"❌ Question {i+1} validation error: {qe}")
                continue

        if len(validated) < questions:
            raise ValueError(f"Insufficient valid questions: got {len(validated)}, need {questions}")

        quiz = {
            "topic": topic,
            "category": category,
            "difficulty": difficulty,
            "questions": validated[:questions]
        }
        print(f"✅ SUCCESS: Using AI-generated quiz with {len(validated)} questions!")
        
    except Exception as e:
        print(f"❌ ERROR: AI generation failed!")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        
        if 'response' in locals() and response:
            print(f"🔍 Raw AI response: {response.text}")
        
        # ✅ FIXED: Enhanced fallback questions
        def generate_enhanced_fallback_questions(topic, category, questions, choices, difficulty):
            fallback = []
            
            # Topic-specific templates
            if "machine learning" in topic.lower():
                base_questions = [
                    f"What is the primary goal of machine learning?",
                    f"Which of the following is a supervised learning algorithm?",
                    f"What is overfitting in machine learning?",
                    f"Which metric is commonly used for classification problems?",
                    f"What is the difference between training and testing data?",
                    f"Which algorithm is best for linear relationships?",
                    f"What is feature engineering?",
                    f"Which of these is an unsupervised learning technique?",
                    f"What is cross-validation used for?",
                    f"Which activation function is commonly used in neural networks?"
                ]
                base_answers = [
                    ["To make predictions from data", "To store data", "To delete data", "To compress data"],
                    ["Linear Regression", "K-means", "PCA", "Apriori"],
                    ["Model performs well on training but poorly on new data", "Model is too simple", "Data is corrupted", "Algorithm is slow"],
                    ["Accuracy", "Mean", "Median", "Standard deviation"],
                    ["Training data is used to build model, testing data evaluates it", "No difference", "Testing data is larger", "Training data is newer"],
                    ["Linear Regression", "Decision Tree", "K-means", "Random Forest"],
                    ["Creating new features from existing data", "Deleting features", "Renaming features", "Copying features"],
                    ["Clustering", "Classification", "Regression", "Prediction"],
                    ["To validate model performance", "To clean data", "To visualize data", "To store data"],
                    ["ReLU", "Linear", "Step", "Constant"]
                ]
                explanations = [
                    "Machine learning aims to learn patterns from data to make accurate predictions on new, unseen data.",
                    "Linear regression is a supervised learning algorithm that learns from labeled training examples.",
                    "Overfitting occurs when a model memorizes training data but fails to generalize to new data.",
                    "Accuracy measures the percentage of correct predictions in classification tasks.",
                    "Training data teaches the model patterns, while testing data provides unbiased evaluation.",
                    "Linear regression is specifically designed to model linear relationships between variables.",
                    "Feature engineering involves transforming raw data into meaningful features for better model performance.",
                    "Clustering groups similar data points without using labeled examples (unsupervised).",
                    "Cross-validation provides robust performance estimates by testing on multiple data splits.",
                    "ReLU (Rectified Linear Unit) is widely used due to its simplicity and effectiveness in neural networks."
                ]
            else:
                # Generic fallback
                base_questions = [f"Sample question {i+1} on {topic} ({difficulty})" for i in range(10)]
                base_answers = [[f"Option {chr(65+j)}" for j in range(choices)] for _ in range(10)]
                explanations = [f"This is a fallback explanation for question {i+1}." for i in range(10)]
            
            for i in range(min(questions, len(base_questions))):
                fallback.append({
                    "question": base_questions[i],
                    "choices": base_answers[i] if i < len(base_answers) else [f"Option {chr(65+j)}" for j in range(choices)],
                    "answer": base_answers[i] if i < len(base_answers) else "Option A",
                    "explanation": explanations[i] if i < len(explanations) else f"This is a fallback explanation for question {i+1}."
                })
            
            # Fill remaining questions if needed
            while len(fallback) < questions:
                idx = len(fallback)
                fallback.append({
                    "question": f"Additional question {idx+1} on {topic} ({difficulty})",
                    "choices": [f"Option {chr(65+j)}" for j in range(choices)],
                    "answer": "Option A",
                    "explanation": f"This is a fallback explanation for question {idx+1}."
                })
            
            return fallback

        fallback_questions = generate_enhanced_fallback_questions(topic, category, questions, choices, difficulty)
        quiz = {
            "topic": topic,
            "category": category,
            "difficulty": difficulty,
            "questions": fallback_questions
        }
        print("🔄 Using enhanced fallback questions")

    # Save quiz
    doc = {
        "user_id": user_id,
        "type": "practice", 
        "topic": topic,
        "category": category,
        "difficulty": difficulty,
        "questions": quiz["questions"],
        "created_at": datetime.now(timezone.utc),
    }
    print(f"🔍 About to insert quiz doc: {doc}")
    res = quizzes_col.insert_one(doc)
    print(f"🔍 Quiz inserted with ID: {res.inserted_id}")
    
    return {"quizId": str(res.inserted_id), "quiz": quiz}


# ✅ ADDED: Validation function (if not already present)
def validate_quiz_params(body):
    errors = []
    
    # Validate required fields
    if not body.get("customTopic") and not body.get("mainTopic"):
        errors.append("Either customTopic or mainTopic is required")
    
    # Validate numeric fields
    try:
        questions = int(body.get("questions", 5))
        if questions < 1 or questions > 50:
            errors.append("Questions must be between 1 and 50")
    except (ValueError, TypeError):
        errors.append("Questions must be a valid number")
    
    try:
        choices = int(body.get("choices", 4))
        if choices < 2 or choices > 6:
            errors.append("Choices must be between 2 and 6")
    except (ValueError, TypeError):
        errors.append("Choices must be a valid number")
    
    # Validate difficulty
    valid_difficulties = ["beginner", "intermediate", "pro", "expert"]
    difficulty = body.get("difficulty", "beginner")
    if difficulty not in valid_difficulties:
        errors.append(f"Difficulty must be one of: {valid_difficulties}")
    
    return errors if errors else None

@app.post("/api/quiz/submit")
@auth_required
def quiz_submit():
    """Submit quiz and update ML predictions"""
    body = request.get_json(force=True) or {}
    quiz_id = body.get("quizId")
    answers = body.get("answers", [])

    if not quiz_id or not isinstance(answers, list):
        return {"error": "quizId and answers are required"}, 400
    
    # Handle ObjectId conversion
    if quiz_id == "mock_id_12345":
        qid = quiz_id
    else:
        try:
            qid = ObjectId(quiz_id)
        except Exception:
            qid = quiz_id

    quiz_doc = quizzes_col.find_one({"_id": qid, "user_id": request.user["uid"]})

    if not quiz_doc:
        return {"error": "Quiz not found"}, 404

    try:
        answer_map = {int(a["index"]): str(a["answer"]) for a in answers if "index" in a and "answer" in a}
    except Exception:
        return {"error": "Invalid answers format"}, 400

    questions = quiz_doc.get("questions", [])
    total = len(questions)
    correct = 0
    detail = []
    
    for i, q in enumerate(questions):
        correct_ans = q.get("answer")
        user_ans = answer_map.get(i)
        is_correct = (user_ans == correct_ans)
        if is_correct:
            correct += 1
        detail.append({
            "index": i,
            "question": q.get("question"),
            "correctAnswer": correct_ans,
            "userAnswer": user_ans,
            "isCorrect": is_correct,
            "explanation": q.get("explanation", "")
        })

    score = {"total": total, "correct": correct}

    attempt_doc = {
        "user_id": request.user["uid"],
        "quiz_id": str(qid),
        "submitted_at": datetime.now(timezone.utc),
        "answers": answers,
        "score": score,
        "detail": detail,
        "topic": quiz_doc.get("topic", "Unknown"),
        "difficulty": quiz_doc.get("difficulty", "beginner")
    }
    
    res = attempts_col.insert_one(attempt_doc)

    # Trigger ML prediction update in background
    try:
        # Get updated attempts and trigger new prediction
        user_id = request.user["uid"]
        all_attempts = list(attempts_col.find({"user_id": user_id}))
        profile = profiles_col.find_one({"studentId": user_id})
        
        if len(all_attempts) >= 3:  # Only predict after sufficient data
            prediction_result = ml_predictor.predict_skill_level(all_attempts, profile)
            
            # Update profile with new prediction
            profiles_col.find_one_and_update(
                {"studentId": user_id},
                {
                    "$set": {
                        "profile.skillLevel": prediction_result['predicted_level'],
                        "performanceMetrics.averageScore": prediction_result['performance_score'],
                        "lastPrediction": {
                            "predictedAt": datetime.now(timezone.utc).isoformat(),
                            "confidence": prediction_result['confidence'],
                            "model": "RandomForest"
                        }
                    }
                }
            )
            
    except Exception as e:
        logger.warning(f"Could not update ML prediction: {e}")

    return {
        "attemptId": str(res.inserted_id),
        "score": score,
        "detail": detail
    }

@app.get("/api/quiz/attempts")
@auth_required
def list_attempts():
    """List quiz attempts"""
    user_id = request.user.get("uid")
    role = request.user.get("role", "student")
    
    try:
        if role == "admin":
            all_attempts = list(attempts_col.find({}))
        else:
            all_attempts = list(attempts_col.find({"user_id": user_id}))
        
        sorted_attempts = sorted(
            all_attempts,
            key=lambda x: x.get("submitted_at", datetime.min),
            reverse=True
        )
        
        out = []
        for a in sorted_attempts:
            out.append({
                "attemptId": str(a.get("_id", "")),
                "quizId": a.get("quiz_id"),
                "submitted_at": a.get("submitted_at").isoformat() + "Z" if a.get("submitted_at") else None,
                "score": a.get("score"),
                "topic": a.get("topic", "Unknown"),
                "difficulty": a.get("difficulty", "beginner")
            })
            
        return {"attempts": out}
        
    except Exception as e:
        return {"error": "Failed to retrieve attempts", "message": str(e)}, 500

@app.get("/api/quiz/attempts/<attempt_id>")
@auth_required
def get_quiz_result(attempt_id):
    """Get detailed quiz result"""
    try:
        user_id = request.user.get("uid")
        role = request.user.get("role", "student")
        
        if attempt_id.startswith("mock_"):
            aid = attempt_id
        else:
            try:
                aid = ObjectId(attempt_id)
            except Exception:
                aid = attempt_id
        
        attempt = None
        if hasattr(attempts_col, '_data'):
            for a in attempts_col._data:
                if str(a.get("_id")) == str(aid):
                    attempt = a
                    break
        else:
            attempt = attempts_col.find_one({"_id": aid})
        
        if not attempt:
            return {"error": "Quiz result not found"}, 404
        
        if role != "admin" and attempt.get("user_id") != user_id:
            return {"error": "Access denied"}, 403
        
        result = {
            "attemptId": str(attempt.get("_id", "")),
            "quizId": attempt.get("quiz_id"),
            "topic": attempt.get("topic", "Unknown"),
            "difficulty": attempt.get("difficulty", "beginner"),
            "submittedAt": attempt.get("submitted_at").isoformat() + "Z" if attempt.get("submitted_at") else None,
            "score": attempt.get("score", {}),
            "detail": attempt.get("detail", [])
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting quiz result: {str(e)}")
        return {"error": f"Failed to get quiz result: {str(e)}"}, 500

# ========================================
# CONTENT GENERATION ENDPOINTS
# ========================================
nlp_processor = AdvancedEducationalNLP("en_core_web_md")

@app.post("/api/content/generate")
@auth_required  
@rate_limit(max_requests=5, window=60)
def generate_nlp_enhanced_content():  
    """Generate content with automatic skill prediction and 18 comprehensive quiz questions"""
    try:
        body = request.get_json(force=True)
        user_id = request.user["uid"]

        topic = body.get('topic', '').strip()
        content_type = body.get('contentType', 'explanation')
        difficulty_override = body.get('difficulty', '')  # Optional manual override
        
        if not topic:
            return {"error": "Topic is required"}, 400
        
        # Get enhanced profile data and AUTOMATICALLY PREDICT skill level
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
            
            # 🤖 AUTO-PREDICT SKILL LEVEL using your existing profile structure
            predicted_skill_level, confidence = predict_student_skill_level_from_profile(profile, topic)
        
        # Use predicted level unless manually overridden
        effective_difficulty = difficulty_override or predicted_skill_level
        
        logger.info(f"🤖 PREDICTED: {predicted_skill_level} (confidence: {confidence:.2f}) | USING: {effective_difficulty} | {topic} | {learning_style} | {department}")
        
        # ✅ STREAMLINED: Use nlp_processor for EVERYTHING
        logger.info("🚀 Generating content and quiz with nlp_processor...")
        
        # Generate content using nlp_processor
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
        
        # Generate quiz using nlp_processor (already working!)
        logger.info("❓ Generating comprehensive quiz questions...")
        quiz_questions = nlp_processor.generate_smart_quiz_questions(
            content_result.get('enhanced_content', ''), 
            num_questions=18,
            difficulty_level=effective_difficulty,
            topic=topic  # This makes it topic-aware
        )
        
        # ✅ Create comprehensive response
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
                
                # Content sections from nlp_processor
                "explanation": content_result.get('explanation', ''),
                "example": content_result.get('examples', ''),
                "exercise": content_result.get('exercises', ''),
                "learning_tip": content_result.get('learning_tips', ''),
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
                
                # Metadata
                "word_count": len(content_result.get('explanation', '').split()),
                "estimated_reading_time": max(1, len(content_result.get('explanation', '').split()) // 200),
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "ai_generated": True,
                "nlp_enhanced": True,
                "auto_predicted": True,
                "spacy_model": "en_core_web_md"
            }
        }
        
        # ✅ Update profile with prediction data
        update_profile_with_prediction_insights(user_id, predicted_skill_level, confidence, {}, topic)
        
        logger.info(f"✅ Generated content: {predicted_skill_level}→{effective_difficulty} | {len(quiz_questions)} questions | confidence: {confidence:.2f}")
        return result, 200
        
    except Exception as e:
        logger.error(f"Enhanced content generation error: {str(e)}")
        return {"error": "Failed to generate content. Please try again."}, 500

def update_profile_with_prediction_insights(user_id, predicted_level, confidence, nlp_analysis, topic):
    """Update user profile with prediction and content interaction data"""
    try:
        update_data = {
            "lastPredictedLevel": predicted_level,
            "predictionConfidence": confidence,
            "lastContentTopic": topic,
            "contentInteractionAt": datetime.now(timezone.utc),
        }
        
        profiles_col.update_one(
            {"studentId": user_id},
            {"$set": update_data},
            upsert=True
        )
        
        logger.info(f"✅ Profile updated with prediction data: {predicted_level} (confidence: {confidence:.2f})")
        
    except Exception as e:
        logger.warning(f"Failed to update profile with prediction data: {e}")

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

def update_profile_with_prediction_insights(user_id, predicted_level, confidence, nlp_analysis, topic):
    """Update user profile with prediction and content interaction data"""
    try:
        update_data = {
            "lastPredictedLevel": predicted_level,
            "predictionConfidence": confidence,
            "lastContentTopic": topic,
            "contentInteractionAt": datetime.now(timezone.utc),
            "predictionValidation": {
                "contentQuality": nlp_analysis['overall_score'],
                "conceptComplexity": nlp_analysis['educational']['concept_complexity'],
                "readabilityScore": nlp_analysis['linguistic']['readability']['flesch_reading_ease']
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

# ========================================
# COURSE ENDPOINTS  
# ========================================
@app.post("/api/courses/create")
@role_required(["teacher", "admin"])
def create_course():
    """Create new course"""
    try:
        body = request.get_json(force=True)
        
        title = body.get("title", "").strip()
        description = body.get("description", "").strip()
        
        if not title or not description:
            return {"error": "Course title and description are required"}, 400
        
        if len(title) < 3:
            return {"error": "Course title must be at least 3 characters"}, 400
        if len(description) < 10:
            return {"error": "Course description must be at least 10 characters"}, 400
        
        user_role = request.user.get("role", "student")
        user_id = request.user["uid"]
        
        course_doc = {
            "title": title,
            "description": description,
            "category": body.get("category", "Programming"),
            "instructor_id": user_id,
            "instructor_name": request.user.get("email", "").split("@")[0],
            "instructor_role": user_role,
            "enrolled_students": [],
            "max_students": int(body.get("maxStudents", 100)),
            "difficulty_level": body.get("difficultyLevel", "intermediate"),
            "duration_weeks": int(body.get("durationWeeks", 8)),
            "tags": body.get("tags", []),
            "is_active": body.get("isActive", True),
            "is_public": body.get("isPublic", True),
            "prerequisites": body.get("prerequisites", []),
            "learning_objectives": body.get("learningObjectives", []),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        res = courses_col.insert_one(course_doc)
        
        logger.info(f"Course created by {user_role} {request.user.get('email')}: {title}")
        
        return {
            "courseId": str(res.inserted_id),
            "message": "Course created successfully",
            "course": {
                "title": title,
                "instructor": course_doc["instructor_name"],
                "difficultyLevel": course_doc["difficulty_level"],
                "maxStudents": course_doc["max_students"]
            }
        }, 201
        
    except Exception as e:
        logger.error(f"Course creation error: {str(e)}")
        return {"error": "Failed to create course"}, 500

@app.get("/api/courses")
@auth_required
def list_courses():
    """List courses with ML-based recommendations"""
    user_role = request.user.get("role", "student")
    user_id = request.user["uid"]
    
    if user_role == "admin":
        courses = courses_col.find({})
    elif user_role == "teacher":
        courses = courses_col.find({"instructor_id": user_id})
    else:
        courses = courses_col.find({"is_active": True})
    
    course_list = []
    for course in courses:
        enrolled_count = len(course.get("enrolled_students", []))
        is_enrolled = user_id in course.get("enrolled_students", [])
        
        course_data = {
            "courseId": str(course["_id"]),
            "title": course.get("title"),
            "description": course.get("description"),
            "category": course.get("category"),
            "instructor": course.get("instructor_name"),
            "enrolledCount": enrolled_count,
            "maxStudents": course.get("max_students", 100),
            "difficultyLevel": course.get("difficulty_level", "intermediate"),
            "durationWeeks": course.get("duration_weeks", 8),
            "tags": course.get("tags", []),
            "isActive": course.get("is_active", True),
            "createdAt": course.get("created_at").isoformat() + "Z" if course.get("created_at") else None
        }
        
        if user_role == "student":
            course_data["isEnrolled"] = is_enrolled
            course_data["canEnroll"] = not is_enrolled and enrolled_count < course.get("max_students", 100)
            
            # Add ML-based course recommendation
            try:
                profile = profiles_col.find_one({"studentId": user_id})
                if profile:
                    user_level = profile.get('profile', {}).get('skillLevel', 'beginner')
                    course_level = course.get("difficulty_level", "intermediate")
                    course_data["recommendationScore"] = calculate_course_recommendation(user_level, course_level)
            except:
                course_data["recommendationScore"] = 0.5
        
        course_list.append(course_data)
    
    # Sort courses by recommendation score for students
    if user_role == "student":
        course_list.sort(key=lambda x: x.get("recommendationScore", 0), reverse=True)
    
    return {"courses": course_list}

def calculate_course_recommendation(user_level, course_level):
    """Calculate ML-based course recommendation score"""
    level_scores = {"beginner": 1, "intermediate": 2, "pro": 3}
    
    user_score = level_scores.get(user_level, 1)
    course_score = level_scores.get(course_level, 2)
    
    diff = abs(user_score - course_score)
    if diff == 0:
        return 1.0  # Perfect match
    elif diff == 1:
        return 0.7  # Adjacent level
    else:
        return 0.3  # Distant level

@app.post("/api/courses/<course_id>/enroll")
@auth_required
def enroll_student(course_id):
    """Enroll student in course"""
    if request.user.get("role", "student") != "student":
        return {"error": "Only students can enroll in courses"}, 403
    
    try:
        cid = ObjectId(course_id) if course_id != "mock_id_12345" else course_id
    except:
        return {"error": "Invalid course ID"}, 400
    
    course = courses_col.find_one({"_id": cid})
    
    if not course:
        return {"error": "Course not found"}, 404
    
    user_id = request.user["uid"]
    enrolled_students = course.get("enrolled_students", [])
    
    if user_id in enrolled_students:
        return {"error": "Already enrolled in this course"}, 409
    
    if len(enrolled_students) >= course.get("max_students", 100):
        return {"error": "Course is full"}, 400
    
    # Update course enrollment
    if hasattr(courses_col, '_data'):
        for doc in courses_col._data:
            if doc.get("_id") == cid:
                doc["enrolled_students"].append(user_id)
                break
    else:
        courses_col.update_one(
            {"_id": cid},
            {"$push": {"enrolled_students": user_id}}
        )
    
    return {
        "message": "Successfully enrolled in course",
        "courseTitle": course.get("title"),
        "enrolledAt": datetime.now(timezone.utc).isoformat() + "Z"
    }

# ========================================
# ANALYTICS ENDPOINTS
# ========================================
@app.get("/api/analytics/me")
@auth_required
def my_analytics():
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
        
        # === CORE PERFORMANCE METRICS === [web:72][web:74]
        total_attempts = len(attempts)
        total_questions = sum(attempt.get("score", {}).get("total", 0) for attempt in attempts)
        total_correct = sum(attempt.get("score", {}).get("correct", 0) for attempt in attempts)
        overall_percentage = round((total_correct / total_questions) * 100, 2) if total_questions > 0 else 0
        
        # === LEARNING PROGRESSION ANALYTICS === [web:76][web:79]
        performance_trend = []
        skill_progression = []
        recent_attempts = sorted(attempts, key=lambda x: x.get("submitted_at", datetime.now()), reverse=True)[:10]
        
        for i, attempt in enumerate(reversed(recent_attempts)):
            score_data = attempt.get("score", {})
            percentage = round((score_data.get("correct", 0) / max(score_data.get("total", 1), 1)) * 100, 2)
            
            performance_trend.append({
                "attempt": i + 1,
                "score": percentage,
                "topic": attempt.get("topic", "Unknown"),
                "difficulty": attempt.get("difficulty", "beginner"),
                "date": attempt.get("submitted_at", datetime.now()).strftime("%Y-%m-%d") if hasattr(attempt.get("submitted_at"), "strftime") else str(attempt.get("submitted_at", ""))[:10]
            })
        
        # === TOPIC-WISE ANALYTICS === [web:79][web:74]
        topic_performance = {}
        difficulty_performance = {"beginner": [], "intermediate": [], "pro": []}
        
        for attempt in attempts:
            topic = attempt.get("topic", "General")
            difficulty = attempt.get("difficulty", "beginner")
            score_data = attempt.get("score", {})
            percentage = (score_data.get("correct", 0) / max(score_data.get("total", 1), 1)) * 100
            
            # Topic analysis
            if topic not in topic_performance:
                topic_performance[topic] = {"attempts": 0, "total_score": 0, "avg_score": 0}
            topic_performance[topic]["attempts"] += 1
            topic_performance[topic]["total_score"] += percentage
            topic_performance[topic]["avg_score"] = round(topic_performance[topic]["total_score"] / topic_performance[topic]["attempts"], 2)
            
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
        
        # === LEARNING PATTERNS & INSIGHTS === [web:77][web:84]
        current_skill_level = "beginner"
        learning_velocity = 0
        consistency_score = 0
        
        if profile:
            current_skill_level = profile.get("profile", {}).get("skillLevel", "beginner")
        
        if len(recent_attempts) >= 3:
            # Learning velocity (improvement rate)
            recent_scores = [att.get("score", {}).get("correct", 0) / max(att.get("score", {}).get("total", 1), 1) * 100 for att in recent_attempts[:5]]
            if len(recent_scores) > 1:
                learning_velocity = round((recent_scores[0] - recent_scores[-1]) / len(recent_scores), 2)
            
            # Consistency score (lower variance = more consistent)
            if recent_scores:
                mean_score = sum(recent_scores) / len(recent_scores)
                variance = sum((score - mean_score) ** 2 for score in recent_scores) / len(recent_scores)
                consistency_score = max(0, round(100 - variance, 2))
        
        # === PERSONALIZED RECOMMENDATIONS === [web:77][web:80]
        recommendations = []
        weak_topics = sorted(topic_performance.items(), key=lambda x: x[1]["avg_score"])[:3]
        strong_topics = sorted(topic_performance.items(), key=lambda x: x[1]["avg_score"], reverse=True)[:3]
        
        # Generate recommendations based on performance [web:74][web:77]
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
        
        # === ACHIEVEMENT & MILESTONES === [web:72][web:74]
        achievements = []
        if total_attempts >= 10:
            achievements.append({"badge": "Quiz Master", "description": "Completed 10+ quizzes"})
        if overall_percentage >= 80:
            achievements.append({"badge": "High Achiever", "description": "80%+ overall accuracy"})
        if len(topic_performance) >= 5:
            achievements.append({"badge": "Explorer", "description": "Practiced 5+ different topics"})
        
        # === LEARNING STREAKS & ENGAGEMENT === [web:74][web:76]
        learning_streak = 0
        if attempts:
            # Calculate learning streak (consecutive days with activity)
            attempt_dates = []
            for attempt in attempts:
                if hasattr(attempt.get("submitted_at"), "date"):
                    attempt_dates.append(attempt.get("submitted_at").date())
                elif isinstance(attempt.get("submitted_at"), str):
                    try:
                        attempt_dates.append(datetime.fromisoformat(attempt.get("submitted_at").replace("Z", "+00:00")).date())
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
        
        # === COMPREHENSIVE RESPONSE === [web:72][web:74]
        return {
            "status": "success",
            "analytics": {
                # Personal Info
                "student": {
                    "id": user_id,
                    "email": student.get("email"),
                    "username": student.get("username", student.get("email", "").split("@")[0]),
                    "memberSince": student.get("created_at").isoformat() + "Z" if student.get("created_at") else None,
                    "currentSkillLevel": current_skill_level
                },
                
                # Core Performance Metrics [web:72][web:74]
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
                
                # Visual Analytics Data [web:76][web:79] 
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
                
                # Learning Insights [web:77][web:80]
                "insights": {
                    "strongestTopics": [{"topic": topic, "score": data["avg_score"]} for topic, data in strong_topics],
                    "weakestTopics": [{"topic": topic, "score": data["avg_score"]} for topic, data in weak_topics],
                    "recommendations": recommendations,
                    "achievements": achievements,
                    "nextMilestone": "Complete 5 more quizzes to unlock Advanced Analytics" if total_attempts < 15 else "Maintain your excellent progress!"
                },
                
                # Course Analytics
                "courses": {
                    "enrolled": len(enrolled_courses),
                    "courseList": [
                        {
                            "courseId": str(course.get("_id")),
                            "title": course.get("title"),
                            "instructor": course.get("instructorName"),
                            "difficulty": course.get("difficultyLevel", "intermediate"),
                            "enrolledAt": course.get("updated_at").isoformat() + "Z" if course.get("updated_at") else None
                        } for course in enrolled_courses
                    ]
                },
                
                # Recent Activity [web:74]
                "recentActivity": [
                    {
                        "attemptId": str(attempt.get("_id")),
                        "topic": attempt.get("topic", "Unknown"),
                        "score": attempt.get("score", {}),
                        "percentage": round((attempt.get("score", {}).get("correct", 0) / max(attempt.get("score", {}).get("total", 1), 1)) * 100, 2),
                        "difficulty": attempt.get("difficulty", "beginner"),
                        "submittedAt": attempt.get("submitted_at").isoformat() + "Z" if hasattr(attempt.get("submitted_at"), "isoformat") else str(attempt.get("submitted_at"))
                    } for attempt in recent_attempts[:5]
                ],
                
                # Metadata
                "lastUpdated": datetime.now().isoformat() + "Z",
                "dataRange": f"Last {total_attempts} attempts" if total_attempts > 0 else "No quiz data available"
            }
        }, 200
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return {"error": f"Failed to load analytics: {str(e)}"}, 500


@app.get("/api/analytics/student/<student_id>")
@auth_required
def get_enhanced_student_analytics(student_id):
    """Get enhanced analytics with ML predictions"""
    user_role = request.user.get("role", "student")
    current_user_id = request.user["uid"]
    
    if user_role == "student" and current_user_id != student_id:
        return {"error": "Access denied"}, 403
    
    try:
        student = users_col.find_one({"_id": student_id})
        if not student:
            return {"error": "Student not found"}, 404
        
        attempts = list(attempts_col.find({"user_id": student_id}))
        enrolled_courses = list(courses_col.find({"enrolled_students": student_id}))
        student_profile = profiles_col.find_one({"studentId": student_id})
        
        # Calculate basic metrics
        total_attempts = len(attempts)
        total_correct = sum(a.get("score", {}).get("correct", 0) for a in attempts)
        total_questions = sum(a.get("score", {}).get("total", 0) for a in attempts)
        overall_percentage = round((total_correct / total_questions * 100) if total_questions > 0 else 0, 2)
        
        # Get ML predictions if sufficient data
        ml_insights = {}
        if attempts:
            try:
                prediction_result = ml_predictor.predict_skill_level(attempts, student_profile)
                ml_insights = {
                    "predictedLevel": prediction_result['predicted_level'],
                    "confidence": prediction_result['confidence'],
                    "performanceScore": prediction_result['performance_score'],
                    "featureImportance": prediction_result['feature_importance'],
                    "recommendations": ml_predictor.get_learning_recommendations(prediction_result, attempts)
                }
            except Exception as e:
                logger.warning(f"ML prediction failed: {e}")
        
        # Analyze performance by topic
        topic_performance = {}
        for attempt in attempts:
            topic = attempt.get("topic", "Unknown")
            score = attempt.get("score", {})
            
            if topic not in topic_performance:
                topic_performance[topic] = {"attempts": 0, "total_correct": 0, "total_questions": 0}
            
            topic_performance[topic]["attempts"] += 1
            topic_performance[topic]["total_correct"] += score.get("correct", 0)
            topic_performance[topic]["total_questions"] += score.get("total", 0)
        
        # Calculate topic analytics
        topic_analytics = {}
        for topic, data in topic_performance.items():
            if data["total_questions"] > 0:
                topic_analytics[topic] = {
                    "attempts": data["attempts"],
                    "averageScore": round((data["total_correct"] / data["total_questions"] * 100), 2),
                    "totalQuestions": data["total_questions"]
                }
        
        # Get current skill level
        current_level = "beginner"
        if student_profile:
            current_level = student_profile.get('profile', {}).get('skillLevel', 'beginner')
        
        # Format course data
        course_list = []
        for course in enrolled_courses:
            course_list.append({
                "courseId": str(course["_id"]),
                "title": course.get("title"),
                "instructor": course.get("instructor_name"),
                "difficulty": course.get("difficulty_level", "intermediate"),
                "enrolledAt": course.get("updated_at").isoformat() + "Z" if course.get("updated_at") else None
            })
        
        # Format recent quiz performance
        quiz_performance = []
        for attempt in attempts[-10:]:  # Last 10 attempts
            score = attempt.get("score", {})
            percentage = round((score.get("correct", 0) / max(score.get("total", 1), 1) * 100), 2)
            
            quiz_performance.append({
                "attemptId": str(attempt["_id"]),
                "quizId": attempt.get("quiz_id"),
                "score": score,
                "percentage": percentage,
                "topic": attempt.get("topic", "Unknown"),
                "difficulty": attempt.get("difficulty", "beginner"),
                "submittedAt": attempt.get("submitted_at").isoformat() + "Z" if attempt.get("submitted_at") else None
            })
        
        return {
            "student": {
                "studentId": student_id,
                "email": student.get("email"),
                "username": student.get("username"),
                "memberSince": student.get("created_at").isoformat() + "Z" if student.get("created_at") else None,
                "currentSkillLevel": current_level
            },
            "performance": {
                "totalAttempts": total_attempts,
                "totalQuestions": total_questions,
                "totalCorrect": total_correct,
                "overallPercentage": overall_percentage,
                "averageScore": round(overall_percentage / 100, 2) if overall_percentage > 0 else 0
            },
            "mlInsights": ml_insights,
            "topicAnalytics": topic_analytics,
            "enrolledCourses": course_list,
            "recentQuizzes": quiz_performance,
            "lastActivity": quiz_performance[-1]["submittedAt"] if quiz_performance else None
        }
        
    except Exception as e:
        logger.error(f"Error in analytics: {str(e)}")
        return {"error": str(e)}, 500

# ========================================
# TEMPLATE ENDPOINTS
# ========================================
@app.get("/api/quiz/templates")
@auth_required  
def list_templates():
    """List quiz templates based on user role"""
    try:
        user_role = request.user.get("role", "student")
        user_id = request.user["uid"]
        
        if user_role == "student":
            query = {
                "$or": [
                    {"user_id": user_id},
                    {"is_public": True}
                ]
            }
        elif user_role == "teacher":
            query = {
                "$or": [
                    {"user_id": user_id},
                    {"is_public": True},
                    {"created_by_role": "teacher"}
                ]
            }
        else:  # admin
            query = {}
        
        templates = templates_col.find(query)
        
        template_list = []
        for template in templates:
            template_list.append({
                "templateId": str(template["_id"]),
                "name": template.get("name"),
                "topic": template.get("topic"),
                "description": template.get("description", ""),
                "questionCount": len(template.get("questions", [])),
                "difficulty": template.get("difficulty", "intermediate"),
                "createdAt": template.get("created_at").isoformat() + "Z" if template.get("created_at") else None,
                "tags": template.get("tags", []),
                "isPublic": template.get("is_public", False),
                "createdBy": template.get("created_by_role", "student"),
                "canEdit": template.get("user_id") == user_id or user_role == "admin"
            })
        
        return {
            "templates": template_list,
            "userRole": user_role,
            "canCreateTemplates": user_role in ["teacher", "admin"]
        }
        
    except Exception as e:
        logger.error(f"Error fetching templates: {e}")
        return {"templates": [], "error": "Failed to fetch templates"}, 500

@app.post("/api/quiz/templates/create")
@role_required(["teacher", "admin"])
def create_template():
    """Create reusable quiz template"""
    try:
        body = request.get_json(force=True)
        
        name = body.get("name", "").strip()
        topic = body.get("topic", "").strip()
        questions = body.get("questions", [])
        
        if not name or not topic:
            return {"error": "Template name and topic are required"}, 400
        
        if not questions or len(questions) == 0:
            return {"error": "At least one question is required"}, 400
        
        # Validate questions
        for i, q in enumerate(questions):
            if not q.get("question") or not q.get("choices") or not q.get("answer"):
                return {"error": f"Question {i+1} is incomplete"}, 400
            if len(q.get("choices", [])) < 2:
                return {"error": f"Question {i+1} needs at least 2 choices"}, 400
            if q.get("answer") not in q.get("choices", []):
                return {"error": f"Question {i+1}: Answer must be one of the choices"}, 400
        
        template_doc = {
            "user_id": request.user["uid"],
            "name": name,
            "topic": topic,
            "description": body.get("description", ""),
            "difficulty": body.get("difficulty", "intermediate"),
            "questions": questions,
            "tags": body.get("tags", []),
            "is_public": body.get("isPublic", False),
            "created_by_role": request.user.get("role", "teacher"),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        res = templates_col.insert_one(template_doc)
        
        logger.info(f"Template created by {request.user.get('role')} {request.user.get('email')}: {name}")
        
        return {
            "templateId": str(res.inserted_id),
            "message": "Template created successfully",
            "template": {
                "name": name,
                "topic": topic,
                "questionCount": len(questions),
                "isPublic": template_doc["is_public"]
            }
        }, 201
        
    except Exception as e:
        logger.error(f"Template creation error: {str(e)}")
        return {"error": "Failed to create template"}, 500

# ========================================
# ADMIN ENDPOINTS
# ========================================
@app.get("/api/admin/users")
@role_required(["admin"])
def list_all_users():
    """Admin endpoint to list all users"""
    try:
        users = []
        for user in users_col.find({}):
            users.append({
                "userId": str(user.get("_id")),
                "email": user.get("email"),
                "username": user.get("username"),
                "role": user.get("role", "student"),
                "createdAt": user.get("created_at").isoformat() + "Z" if user.get("created_at") else None,
                "isActive": user.get("active", True)
            })
        
        return {
            "users": users,
            "total": len(users),
            "roles": ["student", "teacher", "admin"]
        }
    except Exception as e:
        return {"error": str(e)}, 500

@app.post("/api/admin/users/create")
@role_required(["admin"])
def create_user_by_admin():
    """Admin endpoint to create users with specific roles"""
    try:
        body = request.get_json(force=True)
        
        validation_error = validate_required_fields(body, ['email', 'password', 'role'])
        if validation_error:
            return validation_error
        
        email = body.get("email", "").lower().strip()
        username = body.get("username", "").strip()
        password = body.get("password", "")
        role = body.get("role", "student")
        
        if role not in ["student", "teacher", "admin"]:
            return {"error": "Invalid role. Must be: student, teacher, or admin"}, 400
        
        if users_col.find_one({"email": email}):
            return {"error": "Email already registered"}, 409
        
        doc = {
            "email": email,
            "username": username or email.split("@")[0],
            "password_hash": generate_password_hash(password),
            "role": role,
            "created_at": datetime.now(timezone.utc),
            "created_by": request.user["uid"],
            "active": True
        }
        
        res = users_col.insert_one(doc)
        
        logger.info(f"Admin {request.user['email']} created user: {email} with role: {role}")
        
        return {
            "message": f"User created successfully with role: {role}",
            "userId": str(res.inserted_id),
            "user": {
                "email": email,
                "username": doc["username"],
                "role": role
            }
        }, 201
        
    except Exception as e:
        logger.error(f"Admin create user error: {str(e)}")
        return {"error": "Failed to create user"}, 500

# ========================================
# UTILITY FUNCTIONS FOR SAMPLE DATA
# ========================================
def create_sample_data():
    """Create sample data for testing"""
    if hasattr(users_col, '_data') and len(users_col._data) == 0:
        logger.info("Creating sample test data...")
        
        # Sample users
        sample_users = [
            {
                "_id": "68aae935f54d893617540f5b",
                "email": "test@test.com",
                "username": "testuser",
                "password_hash": generate_password_hash("test123"),
                "role": "student",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "_id": "68aae935f54d893617540f5c",
                "email": "teacher@test.com", 
                "username": "teacher",
                "password_hash": generate_password_hash("teacher123"),
                "role": "teacher",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "_id": "68aae935f54d893617540f5d",
                "email": "admin@test.com",
                "username": "admin",
                "password_hash": generate_password_hash("admin123"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
        ]
        
        for user in sample_users:
            users_col._data.append(user)
        
        # Sample course
        sample_course = {
            "_id": "mock_id_12345",
            "title": "Advanced Python Programming with ML",
            "description": "Learn Python with ML-powered personalized tutoring",
            "category": "Programming",
            "instructor_id": "68aae935f54d893617540f5c",
            "instructor_name": "teacher",
            "enrolled_students": [],
            "max_students": 50,
            "difficulty_level": "beginner",
            "duration_weeks": 8,
            "tags": ["python", "ml", "personalized"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        courses_col._data.append(sample_course)
        
        # Sample student profile
        sample_profile = {
            "_id": "profile_mock_123",
            "studentId": "68aae935f54d893617540f5b",
            "profile": {
                "name": "Test User",
                "email": "test@test.com",
                "skillLevel": "beginner",
                "dateJoined": datetime.now(timezone.utc).isoformat(),
                "learningHistory": [],
                "preferences": {
                    "subjects": ["programming"],
                    "learningStyle": "visual"
                }
            },
            "demographics": {
                "age": 20,
                "department": "Computer Science",
                "educationLevel": "undergraduate",
                "preferredLanguage": "english"
            },
            "cognitiveProfile": {
                "learningStyle": "visual",
                "processingSpeed": "moderate",
                "memoryRetention": "high"
            },
            "performanceMetrics": {
                "averageScore": 0,
                "completionRate": 0,
                "timePerTopic": 0,
                "streakDays": 0
            },
            "subjectProficiency": {
                "programming": "beginner",
                "mathematics": "beginner",
                "databases": "beginner"
            },
            "created_at": datetime.now(timezone.utc)
        }
        profiles_col._data.append(sample_profile)
        
        logger.info("✅ Sample data created with ML and spaCy features!")

# ========================================
# DEBUG ENDPOINTS
# ========================================
@app.get("/api/debug/ml-status")
def debug_ml_status():
    """Check ML model status"""
    return {
        "ml_predictor_trained": ml_predictor.is_trained,
        "spacy_model": spacy_model,
        "spacy_available": nlp is not None,
        "nlp_processor_ready": nlp_processor.nlp is not None if nlp_processor else False,
        "feature_names": ml_predictor.feature_names,
        "model_info": {
            "skill_classifier": type(ml_predictor.skill_classifier).__name__,
            "performance_regressor": type(ml_predictor.performance_regressor).__name__
        }
    }

@app.post("/api/debug/train-ml")
def debug_train_ml():
    """Manually trigger ML model training"""
    try:
        results = ml_predictor.train_model()
        return {
            "status": "success",
            "training_results": results,
            "message": "ML models trained successfully"
        }
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/api/debug/users")
def debug_users():
    """Debug endpoint to see users"""
    if hasattr(users_col, '_data'):
        users = []
        for user in users_col._data:
            users.append({
                "_id": user.get("_id"),
                "email": user.get("email"),
                "role": user.get("role")
            })
        return {"users": users, "total": len(users)}
    return {"error": "Not using mock database"}

@app.post("/api/debug/make-admin")
def make_admin():
    """Debug endpoint to make user admin"""
    body = request.get_json(force=True)
    email = body.get("email")
    
    if not email:
        return {"error": "Email is required"}, 400
    
    if hasattr(users_col, '_data'):
        for user in users_col._data:
            if user.get("email") == email:
                user["role"] = "admin"
                return {"message": f"User {email} is now an admin"}
    
    return {"error": "User not found"}, 404

# ========================================
# ERROR HANDLERS & HEALTH CHECK
# ========================================
@app.get("/")
def root():
    return {
        "service": "Advanced AI-Powered Education Platform", 
        "status": "running",
        "features": [
            "Random Forest ML Predictions",
            "Advanced spaCy NLP Processing", 
            "Personalized Content Generation",
            "Adaptive Learning Analytics"
        ]
    }

@app.get("/api/health")
def health():
    try:
        users_col.estimated_document_count()
        return {
            "ok": True, 
            "ml_ready": ml_predictor.is_trained,
            "spacy_ready": nlp is not None,
            "features": [
                "RANDOM_FOREST_PREDICTION", 
                "SPACY_NLP_PROCESSING", 
                "PERSONALIZED_CONTENT", 
                "ADAPTIVE_QUIZZES"
            ]
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}, 500

@app.errorhandler(400)
def bad_request(error):
    return {"error": "Bad request", "details": str(error)}, 400

@app.errorhandler(404)
def not_found(error):
    return {"error": "Resource not found"}, 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Server Error: {error}")
    return {"error": "Internal server error"}, 500

@app.before_request
def log_request():
    logger.info(f"{request.method} {request.url}")

# ========================================
# MAIN ENTRY POINT
# ========================================
if __name__ == "__main__":
    # Initialize sample data and train ML models
    try:
        create_sample_data()
        ensure_indexes()
        
        # Train ML models with sample data
        try:
            ml_predictor.train_model()
            print("✅ ML models trained successfully")
        except Exception as e:
            print(f"⚠️ ML model training failed: {e}")
        
        print("🚀 Starting Advanced AI-Powered Education Backend...")
        print("🤖 Features: Random Forest ML, spaCy NLP, Personalized Content")
        print(f"📊 ML Models: {'Trained' if ml_predictor.is_trained else 'Not Trained'}")
        print(f"🧠 spaCy Model: {spacy_model or 'Not Available'}")
        
        # Railway-compatible port configuration
        port = int(os.environ.get("PORT", 5000))
        debug_mode = os.environ.get('RAILWAY_ENVIRONMENT') != 'production'
        
        print(f"🌐 Server starting on port {port}")
        print(f"🔧 Debug mode: {debug_mode}")
        print(f"🌍 Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'development')}")
        
        app.run(
            host='0.0.0.0', 
            port=port, 
            debug=debug_mode,
            threaded=True  # Better for Railway performance
        )
        
    except Exception as e:
        print(f"❌ Failed to start application: {e}")
        # Still try to start the basic Flask app
        port = int(os.environ.get("PORT", 5000))
        app.run(host='0.0.0.0', port=port, debug=False)