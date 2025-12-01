import google.generativeai as genai
import json
import os
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class QuizGenerator:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
    def generate_quiz(self, topic, category, difficulty, questions=5, choices=4, language="English"):
        """Generate a quiz using Gemini API"""
        try:
            print("🔄 Starting AI generation...")
            
            generationconfig = {
                'temperature': 0.7,
                'top_p': 0.8,
                'top_k': 40,
                'max_output_tokens': 4096,
            }
            
            # Safety settings to avoid blocking content
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            model = genai.GenerativeModel('gemini-2.5-flash', generation_config=generationconfig, safety_settings=safety_settings) 

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

If difficulty is 'pro' or 'expert':
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
            
            # Safely access text
            ai_content = ""
            try:
                if response.parts:
                    ai_content = response.text.strip()
                else:
                    print(f"⚠️ AI Response blocked or empty. Finish reason: {response.candidates[0].finish_reason if response.candidates else 'Unknown'}")
                    raise ValueError("Empty response from AI")
            except Exception as text_err:
                print(f"⚠️ Failed to extract text from response: {text_err}")
                raise ValueError("Failed to extract text from AI response")

            print(f"📥 AI Response received (len={len(ai_content)})")
            
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
            # print(f"🔍 Cleaned JSON content: {json_content[:200]}...")
            
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
                        # print(f"✅ Question {i+1} validated")
                    else:
                        print(f"❌ Question {i+1} failed validation: missing required fields")
                except Exception as qe:
                    print(f"❌ Question {i+1} validation error: {qe}")
                    continue

            if len(validated) < questions:
                # If we have some questions, we can pad with fallback, but for now let's just error if too few
                if len(validated) == 0:
                     raise ValueError(f"No valid questions generated")
                print(f"⚠️ Only got {len(validated)} valid questions out of {questions}")

            return {
                "topic": topic,
                "category": category,
                "difficulty": difficulty,
                "questions": validated[:questions]
            }
            
        except Exception as e:
            print(f"❌ ERROR: AI generation failed!")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            
            # Fallback
            print("⚠️ Switching to fallback generator...")
            return self.generate_enhanced_fallback_questions(topic, category, questions, choices, difficulty)

    def generate_enhanced_fallback_questions(self, topic, category, questions, choices, difficulty):
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
        
        return {
            "topic": topic,
            "category": category,
            "difficulty": difficulty,
            "questions": fallback
        }

    def generate_placement_quiz(self, department, interests, question_count=8):
        """Generate placement quiz"""
        try:
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
            
            response = self.model.generate_content(prompt)
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
                    return validated_questions[:question_count]
            
        except Exception as e:
            logger.error(f"AI placement quiz generation failed: {e}")
        
        # Fallback questions
        return [
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
        ][:question_count]
