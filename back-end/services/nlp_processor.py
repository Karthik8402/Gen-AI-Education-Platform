import spacy
import re
from collections import Counter, defaultdict
import numpy as np
from datetime import datetime
import logging
import os

# Fix textstat imports
try:
    import textstat
    # Use the correct textstat API
    def flesch_reading_ease(text):
        return textstat.flesch_reading_ease(text)
    def flesch_kincaid_grade(text):
        return textstat.flesch_kincaid_grade(text)
    def automated_readability_index(text):
        return textstat.automated_readability_index(text)
except ImportError:
    # Fallback functions if textstat is not available
    def flesch_reading_ease(text):
        return 50.0  # Default moderate readability
    def flesch_kincaid_grade(text):
        return 10.0  # Default grade level
    def automated_readability_index(text):
        return 10.0  # Default reading level

logger = logging.getLogger(__name__)

class AdvancedEducationalNLP:
    """Advanced Educational NLP Processor using spaCy Large Model"""
    
    def __init__(self, model_name='en_core_web_md'):
        """Initialize with large spaCy model for better performance"""
        try:
            self.nlp = spacy.load(model_name)
            self.setup_educational_patterns()
            logger.info(f"✅ Loaded spaCy model: {model_name}")
        except OSError:
            logger.error(f"❌ spaCy model {model_name} not found. Install with: python -m spacy download {model_name}")
            try:
                self.nlp = spacy.load('en_core_web_sm')
                self.setup_educational_patterns()
                logger.info("⚠️ Loaded fallback spaCy model: en_core_web_sm")
            except OSError:
                self.nlp = None
                logger.error("❌ No spaCy model available")
        
        # ✅ ADD THIS: Initialize AI quiz generator
        self.ai_quiz_generator = SimpleAIQuizGenerator()
        logger.info("✅ Initialized AI Quiz Generator")

    def setup_educational_patterns(self):
        """Setup educational-specific patterns and rules"""
        self.skill_indicators = {
            'beginner': {
                'words': ['basic', 'simple', 'introduction', 'overview', 'getting started', 'fundamentals'],
                'complexity_score': 0.2,
                'sentence_length': (5, 15),
                'syllable_threshold': 2
            },
            'intermediate': {
                'words': ['advanced', 'detailed', 'comprehensive', 'in-depth', 'implementation'],
                'complexity_score': 0.5,
                'sentence_length': (10, 25),
                'syllable_threshold': 3
            },
            'expert': {
                'words': ['sophisticated', 'optimization', 'architecture', 'methodology', 'paradigm'],
                'complexity_score': 0.8,
                'sentence_length': (15, 35),
                'syllable_threshold': 4
            }
        }
        
        # Educational keywords by subject
        self.subject_keywords = {
            'Computer Science': ['algorithm', 'data structure', 'programming', 'software', 'code', 'function', 'variable'],
            'Mathematics': ['equation', 'theorem', 'proof', 'formula', 'calculation', 'derivative', 'integral'],
            'Science': ['hypothesis', 'experiment', 'theory', 'observation', 'analysis', 'research'],
            'Engineering': ['design', 'system', 'optimization', 'efficiency', 'technical', 'implementation'],
            'Business': ['strategy', 'management', 'analysis', 'market', 'revenue', 'profit', 'customer']
        }
        
        # Learning style indicators
        self.learning_style_keywords = {
            'visual': ['diagram', 'chart', 'graph', 'image', 'visualization', 'flowchart', 'map'],
            'auditory': ['listen', 'sound', 'rhythm', 'verbal', 'discussion', 'explanation', 'talk'],
            'kinesthetic': ['hands-on', 'practice', 'build', 'create', 'experiment', 'activity', 'exercise'],
            'reading': ['text', 'document', 'written', 'article', 'book', 'literature', 'study']
        }

    def comprehensive_content_analysis(self, content, target_level='intermediate', learning_style='visual', subject='general'):
        """Comprehensive content analysis using spaCy large model"""
        if not self.nlp or not content:
            return self.basic_fallback_analysis(content)

        try:
            doc = self.nlp(content)
            
            # Core linguistic analysis
            linguistic_analysis = self.analyze_linguistics(doc)
            
            # Educational content analysis
            educational_analysis = self.analyze_educational_content(doc, target_level, subject)
            
            # Learning style alignment
            style_analysis = self.analyze_learning_style_alignment(doc, learning_style)
            
            # Content quality assessment
            quality_analysis = self.assess_content_quality(doc, target_level)
            
            # Key concepts extraction
            concepts = self.extract_key_concepts_advanced(doc, subject)
            
            # Generate insights
            insights = self.generate_content_insights(doc, target_level, learning_style, subject)
            
            return {
                'linguistic': linguistic_analysis,
                'educational': educational_analysis,
                'learning_style': style_analysis,
                'quality': quality_analysis,
                'key_concepts': concepts,
                'insights': insights,
                'overall_score': self.calculate_overall_score(linguistic_analysis, educational_analysis, quality_analysis),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Content analysis error: {e}")
            return self.basic_fallback_analysis(content)

    def analyze_linguistics(self, doc):
        """Advanced linguistic analysis using spaCy large model"""
        sentences = list(doc.sents)
        tokens = [token for token in doc if not token.is_space and not token.is_punct]
        words = [token for token in tokens if token.is_alpha]
        
        total_words = len(words)
        if total_words == 0:
            return self._empty_linguistic_analysis()
            
        pos_counts = Counter([token.pos_ for token in words])
        pos_distribution = {pos: count/total_words for pos, count in pos_counts.items()}
        
        # Dependency analysis
        dep_counts = Counter([token.dep_ for token in words])
        
        # Named entities with more detail
        entities = defaultdict(list)
        for ent in doc.ents:
            entities[ent.label_].append({
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'confidence': getattr(ent, '_.score', 1.0)
            })

        # Readability metrics using corrected imports
        text = doc.text
        readability = {
            'flesch_reading_ease': flesch_reading_ease(text),
            'flesch_kincaid_grade': flesch_kincaid_grade(text),
            'automated_readability_index': automated_readability_index(text)
        }

        return {
            'word_count': len(words),
            'sentence_count': len(sentences),
            'avg_words_per_sentence': len(words) / max(len(sentences), 1),
            'avg_sentence_length': np.mean([len(sent.text.split()) for sent in sentences]) if sentences else 0,
            'lexical_diversity': len(set([token.lemma_.lower() for token in words])) / max(len(words), 1),
            'pos_distribution': pos_distribution,
            'dependency_distribution': dict(dep_counts.most_common(10)),
            'named_entities': dict(entities),
            'readability': readability,
            'unique_words': len(set([token.lemma_.lower() for token in words])),
            'complex_words': len([token for token in words if len(token.text) > 6])
        }

    def _empty_linguistic_analysis(self):
        """Return empty linguistic analysis structure"""
        return {
            'word_count': 0,
            'sentence_count': 0,
            'avg_words_per_sentence': 0,
            'avg_sentence_length': 0,
            'lexical_diversity': 0,
            'pos_distribution': {},
            'dependency_distribution': {},
            'named_entities': {},
            'readability': {'flesch_reading_ease': 50.0, 'flesch_kincaid_grade': 10.0, 'automated_readability_index': 10.0},
            'unique_words': 0,
            'complex_words': 0
        }

    def identify_important_sentences(self, doc):
        """Identify important sentences in the document"""
        if not doc.sents:
            return []
        
        sentences = list(doc.sents)
        sentence_scores = []
        
        for sent in sentences:
            score = 0
            words = [token for token in sent if token.is_alpha]
            
            # Score based on sentence length (moderate length preferred)
            if 8 <= len(words) <= 20:
                score += 2
            elif 5 <= len(words) < 8 or 20 < len(words) <= 25:
                score += 1
            
            # Score based on named entities
            entities_in_sent = [ent for ent in doc.ents if sent.start <= ent.start < sent.end]
            score += len(entities_in_sent) * 1.5
            
            # Score based on key terms
            important_pos = ['NOUN', 'VERB', 'ADJ']
            key_terms = [token for token in words if token.pos_ in important_pos]
            score += len(key_terms) * 0.5
            
            # Score based on sentence position (first and last sentences are often important)
            sentence_index = sentences.index(sent)
            if sentence_index == 0 or sentence_index == len(sentences) - 1:
                score += 1
            
            sentence_scores.append((sent, score))
        
        # Sort by score and return top sentences
        sentence_scores.sort(key=lambda x: x[1], reverse=True)
        return [sent.text.strip() for sent, score in sentence_scores[:5]]

    def analyze_educational_content(self, doc, target_level, subject):
        """Analyze content from educational perspective"""
        words = [token for token in doc if token.is_alpha]
        text_lower = doc.text.lower()
        
        # Calculate concept complexity
        complexity_indicators = self.skill_indicators.get(target_level, self.skill_indicators['intermediate'])
        complexity_words = [word for word in complexity_indicators['words'] if word in text_lower]
        concept_complexity = len(complexity_words) / max(len(words), 1) + complexity_indicators['complexity_score']
        concept_complexity = min(concept_complexity, 1.0)
        
        # Technical term density
        subject_terms = self.subject_keywords.get(subject, [])
        technical_terms = [word for word in subject_terms if word.lower() in text_lower]
        technical_term_density = len(technical_terms) / max(len(words), 1)
        
        # Educational verbs (explain, describe, analyze, etc.)
        educational_verbs = ['explain', 'describe', 'analyze', 'compare', 'contrast', 'evaluate', 'understand', 'learn']
        educational_verb_count = sum(1 for verb in educational_verbs if verb in text_lower)
        
        # Question count
        question_count = text_lower.count('?')
        
        return {
            'concept_complexity': concept_complexity,
            'technical_term_density': technical_term_density,
            'educational_verb_count': educational_verb_count,
            'question_count': question_count,
            'subject_relevance': len(technical_terms) / max(len(subject_terms), 1) if subject_terms else 0.5
        }

    def analyze_learning_style_alignment(self, doc, learning_style):
        """Analyze how well content aligns with learning style"""
        text_lower = doc.text.lower()
        
        # Count learning style indicators
        style_keywords = self.learning_style_keywords.get(learning_style, [])
        style_indicators = [keyword for keyword in style_keywords if keyword in text_lower]
        style_indicator_count = len(style_indicators)
        
        # Calculate alignment score
        words = [token for token in doc if token.is_alpha]
        alignment_score = min(style_indicator_count / max(len(words) * 0.1, 1), 1.0)
        
        # Boost score based on learning style specific patterns
        if learning_style == 'visual':
            # Look for visual elements mentions
            visual_patterns = ['see figure', 'as shown', 'diagram', 'chart', 'graph']
            visual_mentions = sum(1 for pattern in visual_patterns if pattern in text_lower)
            alignment_score += visual_mentions * 0.1
            
        elif learning_style == 'kinesthetic':
            # Look for action words and hands-on mentions
            action_words = ['build', 'create', 'make', 'do', 'practice', 'try', 'implement']
            action_mentions = sum(1 for word in action_words if word in text_lower)
            alignment_score += action_mentions * 0.1
            
        alignment_score = min(alignment_score, 1.0)
        
        return {
            'style_indicator_count': style_indicator_count,
            'alignment_score': alignment_score,
            'detected_indicators': style_indicators[:5]  # Top 5 indicators
        }

    def assess_content_quality(self, doc, target_level):
        """Assess overall content quality"""
        words = [token for token in doc if token.is_alpha]
        sentences = list(doc.sents)
        
        # Structure quality (balanced sentence lengths)
        sentence_lengths = [len(sent.text.split()) for sent in sentences]
        avg_sentence_length = np.mean(sentence_lengths) if sentence_lengths else 0
        length_variance = np.var(sentence_lengths) if len(sentence_lengths) > 1 else 0
        structure_score = max(0, 1 - (length_variance / 100))  # Penalize high variance
        
        # Vocabulary richness
        unique_lemmas = set([token.lemma_.lower() for token in words])
        vocabulary_richness = len(unique_lemmas) / max(len(words), 1)
        
        # Readability appropriateness for target level
        readability = flesch_reading_ease(doc.text)
        readability_targets = {
            'beginner': (60, 100),    # Easy to very easy
            'intermediate': (30, 70), # Fairly difficult to standard
            'expert': (0, 50)         # Very difficult to fairly difficult
        }
        
        target_range = readability_targets.get(target_level, (30, 70))
        if target_range[0] <= readability <= target_range[1]:
            readability_score = 1.0
        else:
            # Calculate distance from target range
            if readability < target_range[0]:
                distance = target_range[0] - readability
            else:
                distance = readability - target_range[1]
            readability_score = max(0, 1 - (distance / 50))
        
        # Overall quality score
        overall_quality = (structure_score * 0.3 + vocabulary_richness * 0.3 + readability_score * 0.4)
        
        return {
            'overall_quality': overall_quality,
            'structure_score': structure_score,
            'vocabulary_richness': vocabulary_richness,
            'readability_score': readability_score,
            'avg_sentence_length': avg_sentence_length
        }

    def extract_key_concepts_advanced(self, doc, subject):
        """Extract key concepts from content"""
        concepts = []
        
        # Extract from named entities
        entity_importance = {
            'PERSON': 0.8, 'ORG': 0.9, 'PRODUCT': 0.9, 'TECH': 1.0,
            'GPE': 0.7, 'WORK_OF_ART': 0.8, 'LAW': 0.9, 'LANGUAGE': 0.8
        }
        
        for ent in doc.ents:
            importance = entity_importance.get(ent.label_, 0.6)
            concepts.append({
                'term': ent.text,
                'type': 'named_entity',
                'importance': importance,
                'category': ent.label_
            })
        
        # Extract from noun phrases
        noun_phrases = [chunk.text for chunk in doc.noun_chunks if len(chunk.text.split()) <= 3]
        for phrase in noun_phrases[:5]:  # Top 5 noun phrases
            concepts.append({
                'term': phrase,
                'type': 'noun_phrase',
                'importance': 0.7,
                'category': 'concept'
            })
        
        # Extract subject-specific terms
        subject_terms = self.subject_keywords.get(subject, [])
        text_lower = doc.text.lower()
        for term in subject_terms:
            if term in text_lower:
                concepts.append({
                    'term': term,
                    'type': 'subject_term',
                    'importance': 0.9,
                    'category': subject
                })
        
        # Remove duplicates and sort by importance
        unique_concepts = {}
        for concept in concepts:
            term_lower = concept['term'].lower()
            if term_lower not in unique_concepts or concept['importance'] > unique_concepts[term_lower]['importance']:
                unique_concepts[term_lower] = concept
        
        sorted_concepts = sorted(unique_concepts.values(), key=lambda x: x['importance'], reverse=True)
        return sorted_concepts[:8]  # Return top 8 concepts

    def generate_content_insights(self, doc, target_level, learning_style, subject):
        """Generate insights about the content"""
        insights = []
        
        # Content length insights
        word_count = len([token for token in doc if token.is_alpha])
        if word_count < 100:
            insights.append("Content is quite brief - consider expanding key concepts")
        elif word_count > 1000:
            insights.append("Comprehensive content - consider breaking into sections")
        
        # Complexity insights
        readability = flesch_reading_ease(doc.text)
        if readability > 70 and target_level == 'expert':
            insights.append("Content may be too simple for expert level")
        elif readability < 30 and target_level == 'beginner':
            insights.append("Content complexity may be challenging for beginners")
        
        # Learning style insights
        style_keywords = self.learning_style_keywords.get(learning_style, [])
        style_matches = sum(1 for keyword in style_keywords if keyword in doc.text.lower())
        if style_matches == 0:
            insights.append(f"Consider adding {learning_style}-friendly elements")
        
        return '; '.join(insights) if insights else f"Content analyzed for {target_level} level {learning_style} learners in {subject}"

    def basic_fallback_analysis(self, content):
        """Basic fallback analysis when spaCy is not available"""
        if not content:
            return {
                'linguistic': {'word_count': 0, 'readability': {'flesch_reading_ease': 50}},
                'educational': {'concept_complexity': 0.5},
                'learning_style': {'alignment_score': 0.5},
                'quality': {'overall_quality': 0.5},
                'key_concepts': [],
                'insights': 'Basic content analysis - spaCy not available',
                'overall_score': 0.5,
                'timestamp': datetime.now().isoformat()
            }
        
        words = content.split()
        sentences = content.split('.')
        
        return {
            'linguistic': {
                'word_count': len(words),
                'sentence_count': len(sentences),
                'readability': {'flesch_reading_ease': flesch_reading_ease(content)}
            },
            'educational': {
                'concept_complexity': 0.5,
                'technical_term_density': 0.1
            },
            'learning_style': {
                'alignment_score': 0.5
            },
            'quality': {
                'overall_quality': 0.6
            },
            'key_concepts': [{'term': 'general concept', 'importance': 1.0, 'type': 'fallback'}],
            'insights': 'Basic fallback analysis completed',
            'overall_score': 0.5,
            'timestamp': datetime.now().isoformat()
        }

    def calculate_overall_score(self, linguistic, educational, quality):
        """Calculate overall content score"""
        try:
            readability_score = min(linguistic.get('readability', {}).get('flesch_reading_ease', 50) / 100, 1.0)
            complexity_score = educational.get('concept_complexity', 0.5)
            quality_score = quality.get('overall_quality', 0.5)
            
            return (readability_score * 0.3 + complexity_score * 0.4 + quality_score * 0.3)
        except Exception as e:
            logger.error(f"Score calculation error: {e}")
            return 0.5

    # ========== CONTENT ENHANCEMENT METHODS ==========
    
    def enhance_content_for_learning_style(self, content, learning_style, difficulty_level):
        """Enhance content based on learning style using NLP analysis"""
        if not self.nlp or not content:
            return content
        
        try:
            doc = self.nlp(content)
            enhanced_content = content
            
            # Learning style specific enhancements
            if learning_style == 'visual':
                enhanced_content = self._add_visual_structure(content, doc)
            elif learning_style == 'auditory':
                enhanced_content = self._add_auditory_cues(content, doc)
            elif learning_style == 'kinesthetic':
                enhanced_content = self._add_kinesthetic_elements(content, doc)
            elif learning_style == 'reading':
                enhanced_content = self._add_reading_structure(content, doc)
            
            # Adjust complexity based on difficulty level
            enhanced_content = self._adjust_content_complexity(enhanced_content, difficulty_level)
            
            return enhanced_content
            
        except Exception as e:
            logger.error(f"Content enhancement error: {e}")
            return content

    def _add_visual_structure(self, content, doc):
        """Add visual structure markers for visual learners"""
        # Add emojis and visual markers to headers
        enhanced = re.sub(r'^##\s*([^#\n]+)', r'🎯 ## \1', content, flags=re.MULTILINE)
        enhanced = re.sub(r'^\*\*([^*]+)\*\*', r'✨ **\1**', enhanced, flags=re.MULTILINE)
        
        # Add visual breaks between sections
        enhanced = re.sub(r'\n\n([A-Z][^.\n]*:)', r'\n\n📋 \1', enhanced)
        
        return enhanced

    def _add_auditory_cues(self, content, doc):
        """Add auditory-friendly cues"""
        # Add emphasis markers for better rhythm when read aloud
        enhanced = re.sub(r'(\. )([A-Z])', r'\1\n🎵 \2', content)
        enhanced = re.sub(r'(important|key|critical|essential)', r'**\1**', enhanced, flags=re.IGNORECASE)
        
        return enhanced

    def _add_kinesthetic_elements(self, content, doc):
        """Add hands-on elements for kinesthetic learners"""
        # Add action-oriented language and practice prompts
        enhanced = content.replace('understand', 'practice and understand')
        enhanced = enhanced.replace('learn about', 'explore and learn')
        
        # Add practice prompts at the end of sections
        sections = enhanced.split('\n\n')
        enhanced_sections = []
        for section in sections:
            enhanced_sections.append(section)
            if len(section) > 100:  # Only add to substantial sections
                enhanced_sections.append("💪 **Try it:** Practice this concept with a hands-on exercise.")
        
        return '\n\n'.join(enhanced_sections)

    def _add_reading_structure(self, content, doc):
        """Enhance structure for reading learners"""
        # Add detailed structure and reading guides
        enhanced = content.replace('\n##', '\n\n📚 Reading Guide:\n##')
        enhanced = enhanced.replace('\n\n', '\n\n📖 ')
        
        return enhanced

    def _adjust_content_complexity(self, content, difficulty_level):
        """Adjust content complexity based on difficulty level"""
        if difficulty_level == 'beginner':
            # Simplify language
            content = content.replace('utilize', 'use')
            content = content.replace('implement', 'create')
            content = content.replace('methodology', 'method')
            
        elif difficulty_level == 'expert':
            # Add more technical depth indicators
            content = f"🔬 **Advanced Topic:** {content}"
            
        return content
    
    def generate_educational_content(self, topic, difficulty_level='intermediate', learning_style='visual', content_type='explanation', subject='general'):
        """Generate complete educational content using NLP and LLM integration"""
        
        try:
            # Import the LLM library (add this at the top of your file if not already there)
            import google.generativeai as genai
            
            # Create comprehensive prompt based on NLP analysis
            prompt = self._create_content_prompt(topic, difficulty_level, learning_style, content_type, subject)
            
            # Generate content using LLM
            logger.info(f"🎯 Generating {content_type} content for {topic} ({difficulty_level} level)")
            response = genai.GenerativeModel('gemini-2.5-flash').generate_content(prompt)
            raw_content = response.text.strip()
            
            if not raw_content:
                logger.error("LLM returned empty content")
                return self._generate_fallback_content(topic, difficulty_level, learning_style, subject)
            
            # Enhance content using NLP analysis
            enhanced_content = self.enhance_content_for_learning_style(raw_content, learning_style, difficulty_level)
            
            # Parse content into sections using NLP
            parsed_sections = self._parse_content_sections(enhanced_content)
            
            # Analyze the generated content
            content_analysis = self.comprehensive_content_analysis(
                enhanced_content, 
                target_level=difficulty_level,
                learning_style=learning_style,
                subject=subject
            )
            
            # Create final content structure
            content_result = {
                'explanation': parsed_sections.get('explanation', enhanced_content),
                'examples': parsed_sections.get('examples', ''),
                'exercises': parsed_sections.get('exercises', ''),
                'learning_tips': parsed_sections.get('tips', ''),
                'enhanced_content': enhanced_content,
                'raw_content': raw_content,
                'topic': topic,
                'difficulty': difficulty_level,
                'learning_style': learning_style,
                'subject': subject,
                'content_analysis': content_analysis,
                'word_count': content_analysis['linguistic']['word_count'],
                'readability_score': content_analysis['linguistic']['readability']['flesch_reading_ease'],
                'quality_score': content_analysis['quality']['overall_quality'],
                'nlp_generated': True,
                'generated_at': datetime.now().isoformat()
            }
            
            logger.info(f"✅ Generated {len(enhanced_content.split())} words of {difficulty_level} content for {topic}")
            return content_result
            
        except Exception as e:
            logger.error(f"Content generation failed: {e}")
            return self._generate_fallback_content(topic, difficulty_level, learning_style, subject)
    
    def _create_content_prompt(self, topic, difficulty_level, learning_style, content_type, subject):
        """Create optimized prompt for content generation"""
        
        # Difficulty-specific instructions
        difficulty_instructions = {
            'beginner': {
                'complexity': 'simple and clear language',
                'depth': 'basic concepts with step-by-step explanations',
                'examples': 'simple, relatable examples',
                'vocabulary': 'common terms with definitions'
            },
            'intermediate': {
                'complexity': 'moderate complexity with detailed explanations',
                'depth': 'comprehensive coverage with practical applications',
                'examples': 'real-world scenarios and use cases',
                'vocabulary': 'technical terms with context'
            },
            'expert': {
                'complexity': 'advanced concepts and sophisticated analysis',
                'depth': 'in-depth technical details and optimization',
                'examples': 'complex scenarios and edge cases',
                'vocabulary': 'professional terminology and best practices'
            }
        }
        
        # Learning style adaptations
        style_adaptations = {
            'visual': 'Include references to diagrams, charts, and visual representations. Use spatial metaphors and describe visual relationships.',
            'auditory': 'Use rhythmic language, emphasize verbal explanations, and include discussion points.',
            'kinesthetic': 'Focus on hands-on activities, practical exercises, and interactive elements.',
            'reading': 'Provide comprehensive text, detailed explanations, and extensive written materials.'
        }
        
        diff_settings = difficulty_instructions.get(difficulty_level, difficulty_instructions['intermediate'])
        style_adaptation = style_adaptations.get(learning_style, style_adaptations['visual'])
        
        prompt = f"""
Create comprehensive educational content about "{topic}" for {difficulty_level}-level students in {subject}.

DIFFICULTY LEVEL: {difficulty_level.upper()}
- Use {diff_settings['complexity']}
- Provide {diff_settings['depth']}
- Include {diff_settings['examples']}
- Apply {diff_settings['vocabulary']}

LEARNING STYLE: {learning_style.upper()}
- {style_adaptation}

CONTENT STRUCTURE:
Generate ALL sections below for complete coverage:

## EXPLANATION
Provide a detailed explanation suitable for {difficulty_level} level:
- Clear definition and core concepts
- How it works with step-by-step breakdown  
- Why it's important in {subject}
- Real-world applications and relevance
- Key terminology with appropriate explanations

Target: 500-700 words optimized for {learning_style} learners.

## PRACTICAL EXAMPLES  
Provide 3-4 detailed examples specific to {subject}:

**Example 1: Basic Application**
[Detailed example with setup, process, and outcome]

**Example 2: Intermediate Use Case** 
[More complex example with multiple steps]

**Example 3: Advanced Scenario**
[Real-world professional application]

Include code, diagrams descriptions, or practical scenarios as appropriate.

## HANDS-ON EXERCISES
Create 4-5 progressive exercises:

**Exercise 1: Fundamentals** ({difficulty_level.title()} Level)
- Objective: [Learning goal]
- Instructions: [Step-by-step guide]
- Expected Outcome: [What to achieve]

**Exercise 2: Application** 
- Objective: [Learning goal]
- Instructions: [Detailed steps]
- Expected Outcome: [Success criteria]

Continue with exercises of increasing complexity suitable for {difficulty_level} level.

## LEARNING TIPS
Provide 6-8 actionable study tips:

**For {learning_style.title()} Learners:**
- [Specific tip for learning style]
- [Another learning style tip]

**For {subject} Context:**
- [Subject-specific tip]
- [Professional application tip]

**General Study Strategies:**
- [Memory techniques]
- [Practice methods]  
- [Common pitfalls to avoid]

FORMATTING REQUIREMENTS:
- Use clear headings and subheadings
- Apply engaging language appropriate for {difficulty_level} level
- Adapt complexity and examples to {subject} field
- Ensure content flows logically from basic to advanced concepts
- Include transition sentences between sections
"""
        
        return prompt
    
    def _parse_content_sections(self, content):
        """Parse content into structured sections using NLP"""
        
        sections = {
            'explanation': '',
            'examples': '',
            'exercises': '',
            'tips': ''
        }
        
        # Enhanced section patterns with variations
        patterns = {
            'explanation': [
                r'##\s*EXPLANATION(.*?)(?=##|$)',
                r'##\s*Explanation(.*?)(?=##|$)',
                r'# Explanation(.*?)(?=##|#|$)'
            ],
            'examples': [
                r'##\s*PRACTICAL EXAMPLES(.*?)(?=##|$)',
                r'##\s*Examples(.*?)(?=##|$)',
                r'##\s*Practical Examples(.*?)(?=##|$)',
                r'##\s*EXAMPLES(.*?)(?=##|$)'
            ],
            'exercises': [
                r'##\s*HANDS-ON EXERCISES(.*?)(?=##|$)',
                r'##\s*Exercises(.*?)(?=##|$)',
                r'##\s*EXERCISES(.*?)(?=##|$)',
                r'##\s*Hands-on Exercises(.*?)(?=##|$)'
            ],
            'tips': [
                r'##\s*LEARNING TIPS(.*?)(?=##|$)',
                r'##\s*Learning Tips(.*?)(?=##|$)',
                r'##\s*Tips(.*?)(?=##|$)',
                r'##\s*TIPS(.*?)(?=##|$)'
            ]
        }
        
        for section, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
                if match:
                    section_content = match.group(1).strip()
                    sections[section] = section_content
                    break  # Use first match found
        
        # If sections not found, try to extract from content structure
        if not any(sections.values()):
            # Fallback: split content into paragraphs and assign to explanation
            paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
            if paragraphs:
                sections['explanation'] = '\n\n'.join(paragraphs[:3])  # First 3 paragraphs
                if len(paragraphs) > 3:
                    sections['tips'] = '\n\n'.join(paragraphs[-2:])  # Last 2 paragraphs
        
        return sections
    
    def _generate_fallback_content(self, topic, difficulty_level, learning_style, subject):
        """Generate fallback content when LLM is unavailable"""
        
        fallback_content = f"""
# Understanding {topic}

## Introduction

{topic} is an important concept in {subject} that {difficulty_level}-level students should understand. This content is designed for {learning_style} learners to provide comprehensive coverage of the subject.

## Key Concepts

The fundamental principles of {topic} include:
- Core definitions and terminology
- Essential processes and mechanisms  
- Practical applications and use cases
- Best practices and guidelines

## How {topic} Works

{topic} operates through a systematic approach that involves multiple components working together. Understanding these mechanisms is crucial for effective implementation and application.

## Applications in {subject}

In the field of {subject}, {topic} has numerous practical applications:
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

## Learning Tips for {learning_style.title()} Learners

- Adapt your study approach to match your {learning_style} learning style
- Practice regularly to reinforce understanding
- Connect new concepts to existing knowledge
- Seek additional resources and examples

## Summary

Mastering {topic} requires dedication, practice, and continuous learning. This foundational knowledge will serve as a stepping stone for more advanced concepts in {subject}.
"""

        return {
            'explanation': fallback_content,
            'examples': f"Example applications of {topic} in {subject} context.",
            'exercises': f"Practice exercises for {topic} at {difficulty_level} level.",
            'learning_tips': f"Study tips for {learning_style} learners in {subject}.",
            'enhanced_content': fallback_content,
            'raw_content': fallback_content,
            'topic': topic,
            'difficulty': difficulty_level,
            'learning_style': learning_style,
            'subject': subject,
            'word_count': len(fallback_content.split()),
            'nlp_generated': False,
            'fallback_used': True,
            'generated_at': datetime.now().isoformat()
        }
    
    def generate_smart_quiz_questions(self, content, num_questions=18, difficulty_level='intermediate', topic=""):
        """Generate quiz using AI - Simple and effective"""
        try:
            logger.info(f"🎯 Generating {num_questions} AI quiz questions for {topic} at {difficulty_level} level")
            
            # Use the AI quiz generator
            questions = self.ai_quiz_generator.generate_ai_quiz(
                generated_content=content,
                topic=topic,
                difficulty_level=difficulty_level,
                num_questions=num_questions
            )
            
            if questions and len(questions) >= 5:
                logger.info(f"✅ Generated {len(questions)} quiz questions successfully")
                return questions
            else:
                logger.warning("AI generated insufficient questions, creating enhanced fallback")
                return self._create_enhanced_fallback_quiz(num_questions, difficulty_level, topic)
            
        except Exception as e:
            logger.error(f"Quiz generation error: {e}")
            return self._create_enhanced_fallback_quiz(num_questions, difficulty_level, topic)
    
    def _create_enhanced_fallback_quiz(self, num_questions, difficulty_level, topic):
        """Create enhanced fallback with at least 15 questions"""
        questions = []
        
        # Create enough questions to meet minimum requirement
        template_count = max(num_questions, 15)
        
        for i in range(template_count):
            if difficulty_level == 'beginner':
                base_questions = [
                    f"What is a fundamental concept in {topic}?",
                    f"Which statement best describes {topic}?",
                    f"What is the main purpose of {topic}?",
                    f"How would you define {topic} for a beginner?",
                    f"What makes {topic} important to learn?"
                ]
                
                correct_answers = [
                    f"Understanding the fundamental principles and core concepts of {topic}",
                    f"{topic} is a systematic approach to solving problems effectively",
                    f"To provide structured methods for understanding and applying concepts",
                    f"{topic} is a methodical way of approaching and solving problems"
                ]
            else:  # intermediate/expert
                base_questions = [
                    f"How do you implement {topic} best practices?",
                    f"What considerations are important when using {topic}?",
                    f"How would you troubleshoot common {topic} issues?",
                    f"What approach works best for {topic} projects?"
                ]
                
                correct_answers = [
                    f"Follow established standards, implement proper testing, and maintain documentation",
                    f"Consider performance, maintainability, scalability, and user requirements",
                    f"Use systematic debugging, analyze logs, and test incrementally",
                    f"Plan thoroughly, break down tasks, and use iterative development",
                    f"Implement code reviews, write tests, and refactor regularly",
                ]
            
            question_text = base_questions[i % len(base_questions)]
            correct_answer = correct_answers[i % len(correct_answers)]
            
            # Generate wrong answers
            wrong_answers = [
                "Focus only on memorizing without understanding underlying concepts",
                "Use the most complex approach available regardless of the situation", 
                "Avoid planning and documentation to save time during implementation"
            ]
            
            questions.append({
                'id': i + 1,
                'question': question_text,
                'choices': [correct_answer] + wrong_answers,
                'answer': correct_answer,
                'explanation': f"This tests {difficulty_level} level understanding of {topic} concepts and applications.",
                'difficulty': difficulty_level,
                'type': 'enhanced_fallback',
                'topic': topic
            })
        
        logger.info(f"✅ Created enhanced fallback quiz with {len(questions)} questions for {topic}")
        return questions[:num_questions]    

class SimpleAIQuizGenerator:
    """Simple, AI-powered quiz generation for any topic"""
    
    def __init__(self):
        self.genai = None
        try:
            import google.generativeai as genai
            
            # ✅ CONFIGURE API KEY FROM ENVIRONMENT
            api_key = os.getenv('GOOGLE_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                self.genai = genai
                logger.info("✅ Google AI configured successfully")
            else:
                logger.error("❌ GOOGLE_API_KEY not found in environment variables")
                
        except ImportError:
            logger.warning("❌ Google GenerativeAI not available - install with: pip install google-generativeai")
        except Exception as e:
            logger.error(f"❌ Google AI configuration failed: {e}")
    
    def generate_ai_quiz(self, generated_content, topic, difficulty_level, num_questions=18):
        """Generate quiz using only AI - Simple and effective"""
        try:
            if not self.genai:
                return self._generate_simple_fallback_quiz(num_questions, difficulty_level, topic)
            
            logger.info(f"🎯 Generating {num_questions} AI questions for {topic} at {difficulty_level} level")
            
            prompt = f"""
Create a {num_questions}-question multiple choice quiz about "{topic}" for {difficulty_level} level students.

GENERATED EDUCATIONAL CONTENT TO BASE QUESTIONS ON:
{generated_content[:2500]}

REQUIREMENTS:
- Generate exactly {num_questions} questions based on the content above
- Each question must have exactly 4 multiple choice options (A, B, C, D)
- First choice is always the correct answer
- Questions should test understanding at {difficulty_level} level
- Mix different question types: concepts (60%), applications (25%), analysis (15%)
- Base questions specifically on the provided educational content
- Make questions relevant and educational

DIFFICULTY GUIDELINES:
- {difficulty_level.title()} level: {"Simple, clear questions about basic concepts" if difficulty_level == "beginner" else "Practical application questions" if difficulty_level == "intermediate" else "Complex analysis and optimization questions"}

OUTPUT FORMAT (JSON Array):
[
  {{
    "question": "What is...",
    "choices": ["Correct answer", "Wrong option 1", "Wrong option 2", "Wrong option 3"],
    "answer": "Correct answer",
    "explanation": "Brief explanation why this answer is correct",
    "type": "concept",
    "difficulty": "{difficulty_level}"
  }},
  ... (continue for all {num_questions} questions)
]

Generate exactly {num_questions} questions in this JSON format.
"""

            response = self.genai.GenerativeModel('gemini-2.5-flash').generate_content(prompt)
            
            # Parse and process AI response
            questions = self._parse_ai_response(response.text, topic, difficulty_level)
            
            if questions and len(questions) >= 5:
                logger.info(f"✅ AI generated {len(questions)} questions for {topic}")
                return questions[:num_questions]
            else:
                logger.warning("AI generated insufficient questions, using fallback")
                return self._generate_simple_fallback_quiz(num_questions, difficulty_level, topic)
                
        except Exception as e:
            logger.error(f"AI quiz generation failed: {e}")
            return self._generate_simple_fallback_quiz(num_questions, difficulty_level, topic)
    
    def _parse_ai_response(self, response_text, topic, difficulty_level):
        """Parse AI response into structured questions"""
        try:
            import json
            import re
            
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                questions_data = json.loads(json_match.group())
                
                processed_questions = []
                for i, q in enumerate(questions_data):
                    if self._validate_question(q):
                        processed_questions.append({
                            'id': i + 1,
                            'question': q.get('question', ''),
                            'choices': q.get('choices', []),
                            'answer': q.get('answer', ''),
                            'explanation': q.get('explanation', 'This tests understanding of the concept.'),
                            'difficulty': difficulty_level,
                            'type': q.get('type', 'general'),
                            'topic': topic
                        })
                
                return processed_questions
            
            # If JSON parsing fails, try line-by-line parsing
            return self._parse_structured_response(response_text, topic, difficulty_level)
            
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            return []
    
    def _validate_question(self, question):
        """Validate a single question structure"""
        required_fields = ['question', 'choices', 'answer']
        
        if not all(field in question for field in required_fields):
            return False
        
        choices = question.get('choices', [])
        if len(choices) != 4:
            return False
        
        answer = question.get('answer', '')
        if answer not in choices:
            return False
        
        return True
    
    def _parse_structured_response(self, response_text, topic, difficulty_level):
        """Fallback parser for structured text responses"""
        questions = []
        lines = response_text.split('\n')
        
        current_question = {}
        choices = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('Q') or line.startswith(('1.', '2.', '3.')):
                # Save previous question if complete
                if current_question and choices:
                    current_question['choices'] = choices
                    current_question['answer'] = choices[0]  # First choice is correct
                    questions.append(current_question)
                
                # Start new question
                current_question = {
                    'question': re.sub(r'^Q\d+[.:]?\s*', '', line),
                    'difficulty': difficulty_level,
                    'type': 'general',
                    'topic': topic,
                    'explanation': 'This tests understanding of the concept.'
                }
                choices = []
            
            elif line.startswith(('A)', 'B)', 'C)', 'D)', 'a)', 'b)', 'c)', 'd)')):
                choice_text = re.sub(r'^[A-Da-d][).]?\s*', '', line)
                if choice_text:
                    choices.append(choice_text)
        
        # Add last question
        if current_question and choices:
            current_question['choices'] = choices
            current_question['answer'] = choices[0]
            questions.append(current_question)
        
        # Add IDs and validate
        processed_questions = []
        for i, q in enumerate(questions):
            if len(q.get('choices', [])) == 4:
                q['id'] = i + 1
                processed_questions.append(q)
        
        return processed_questions
    
    def _generate_simple_fallback_quiz(self, num_questions, difficulty_level, topic):
        """Simple fallback when AI fails"""
        questions = []
        
        # Create basic questions based on difficulty and topic
        for i in range(min(num_questions, 10)):
            if difficulty_level == 'beginner':
                question_text = f"What is a fundamental concept in {topic}?"
                choices = [
                    f"A core principle that helps understand {topic}",
                    f"An advanced technique only experts use",
                    f"Something that makes {topic} more complicated",
                    f"A concept not relevant to {topic}"
                ]
            elif difficulty_level == 'expert':
                question_text = f"How would you optimize {topic} for advanced applications?"
                choices = [
                    f"Apply advanced techniques and consider scalability in {topic}",
                    f"Use the simplest possible approach",
                    f"Ignore performance considerations",
                    f"Focus only on basic functionality"
                ]
            else:  # intermediate
                question_text = f"What best practices apply when working with {topic}?"
                choices = [
                    f"Follow established guidelines and consider practical applications of {topic}",
                    f"Always use the most complex solution available",
                    f"Skip planning and implement immediately",
                    f"Copy solutions without understanding"
                ]
            
            questions.append({
                'id': i + 1,
                'question': question_text,
                'choices': choices,
                'answer': choices[0],
                'explanation': f"This tests {difficulty_level} understanding of {topic}.",
                'difficulty': difficulty_level,
                'type': 'fallback',
                'topic': topic
            })
        
        return questions

# Integration with your existing system
def update_your_nlp_processor():
    """Add this to your AdvancedEducationalNLP class"""
    
    class AdvancedEducationalNLP:
        def __init__(self, model_name='en_core_web_md'):
            # Your existing initialization
            self.ai_quiz_generator = SimpleAIQuizGenerator()
        
        def generate_smart_quiz_questions(self, content, num_questions=18, difficulty_level='intermediate', topic=""):
            """REPLACED: Simple AI-only quiz generation"""
            try:
                logger.info(f"🎯 Generating AI quiz for {topic} at {difficulty_level} level")
                
                # Use AI to generate quiz based on content
                questions = self.ai_quiz_generator.generate_ai_quiz(
                    generated_content=content,
                    topic=topic,
                    difficulty_level=difficulty_level,
                    num_questions=num_questions
                )
                
                logger.info(f"✅ Generated {len(questions)} questions successfully")
                return questions
                
            except Exception as e:
                logger.error(f"Quiz generation error: {e}")
                return self.ai_quiz_generator._generate_simple_fallback_quiz(num_questions, difficulty_level, topic)
        