import numpy as np
import logging
from datetime import datetime, timezone, timedelta
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Initialize logger
logger = logging.getLogger(__name__)

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
