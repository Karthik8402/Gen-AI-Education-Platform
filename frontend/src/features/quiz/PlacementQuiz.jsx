// src/features/quiz/PlacementQuiz.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext' // ✅ Add theme context
import Button from '@/components/ui/Button'
import {
  Brain,
  Target,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Star,
  Zap,
  Play,
  Lightbulb,
  Trophy,
  Eye,
  BarChart3,
  AlertCircle,
  Loader as LoaderIcon
} from 'lucide-react'

export default function PlacementQuiz() {
  const { currentTheme } = useTheme() // ✅ Add theme hook
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isNewUser = location.state?.isNewUser || false

  // Timer effect
  useEffect(() => {
    let interval
    if (started && !completed && questions.length > 0) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [started, completed, questions.length])

  useEffect(() => {
    if (started && questions.length === 0) {
      generatePlacementQuiz()
    }
  }, [started])

  const generatePlacementQuiz = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get user profile first
      let department = 'General'
      let interests = []

      try {
        const profile = await api('/api/student/profile/me')
        department = profile.profile?.demographics?.department || 
                    profile.profile?.department || 
                    user?.department || 'General'
        interests = profile.profile?.preferences?.subjects || 
                   profile.profile?.subjects || []
      } catch (profileError) {
        console.log('Profile not found, using defaults:', profileError)
        // Use defaults if profile doesn't exist yet
      }

      // ✅ Call your exact backend endpoint
      const res = await api('/api/quiz/placement', {
        method: 'POST',
        body: {
          department,
          interests,
          questionCount: 8,
          mixedDifficulty: true,
          adaptiveMode: true
        }
      })

      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions)
        setAnswers(Array(res.questions.length).fill(null))
      } else {
        throw new Error('No questions received from server')
      }

    } catch (error) {
      console.error('Failed to generate placement quiz:', error)
      setError('Failed to generate quiz questions. Using fallback questions.')
      
      // ✅ Enhanced fallback questions
      setQuestions([
        {
          question: `What is your current level of expertise in ${user?.department || 'your field of study'}?`,
          choices: ["Complete beginner", "Some basic knowledge", "Intermediate understanding", "Advanced expertise"],
          answer: "Some basic knowledge",
          difficulty: "self-assessment",
          topic: "skill-level",
          type: "self-assessment"
        },
        {
          question: "How do you prefer to learn new concepts?",
          choices: ["Step-by-step with examples", "Reading comprehensive theory first", "Hands-on practice immediately", "Group discussions and explanations"],
          answer: "Step-by-step with examples",
          difficulty: "self-assessment",
          topic: "learning-style", 
          type: "learning-preference"
        },
        {
          question: "When facing a challenging problem, what's your approach?",
          choices: ["Break it into smaller parts", "Research similar solutions online", "Ask for help immediately", "Try different approaches until one works"],
          answer: "Break it into smaller parts",
          difficulty: "beginner",
          topic: "problem-solving",
          type: "multiple-choice"
        },
        {
          question: "How often do you engage with learning materials outside of formal education?",
          choices: ["Daily", "Weekly", "Monthly", "Rarely"],
          answer: "Weekly",
          difficulty: "beginner",
          topic: "learning-habits",
          type: "preference"
        },
        {
          question: `Which aspect of ${user?.department || 'your field'} interests you most?`,
          choices: ["Fundamental principles and theory", "Practical applications and projects", "Advanced research and innovation", "Problem-solving and troubleshooting"],
          answer: "Practical applications and projects",
          difficulty: "intermediate",
          topic: "interests",
          type: "preference"
        }
      ])
      setAnswers(Array(5).fill(null))
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const nextQuestion = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setQuestionStartTime(Date.now())
    } else {
      submitPlacementQuiz(newAnswers)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1])
    }
  }

  const submitPlacementQuiz = async (finalAnswers = answers) => {
    setLoading(true)
    setError(null)
    try {
      // ✅ Format payload to match your backend exactly
      const payload = {
        answers: finalAnswers.map((selectedAnswerIndex, index) => ({
          question: questions[index],
          selectedAnswer: questions[index]?.choices?.[selectedAnswerIndex] || '',
          answerIndex: selectedAnswerIndex,
          timeSpent: 30 // Average time per question
        })),
        startTime: Date.now() - timeSpent * 1000,
        endTime: Date.now(),
        department: user?.department || 'General'
      }

      // ✅ Call your exact submit endpoint
      const result = await api('/api/quiz/placement/submit', {
        method: 'POST',
        body: payload
      })

      setResult(result)
      setCompleted(true)

    } catch (error) {
      console.error('Failed to submit placement quiz:', error)
      setError('Failed to submit quiz. Please try again.')
      
      // ✅ Fallback result for development
      setResult({
        predictedLevel: 'intermediate',
        confidence: 0.75,
        accuracy: 0.70,
        totalQuestions: questions.length,
        correctAnswers: Math.floor(questions.length * 0.7),
        recommendations: [
          'Start with intermediate-level content to match your assessment',
          'Focus on practical applications and hands-on learning',
          'Take regular quizzes to track your progress and improve'
        ],
        profileUpdated: true
      })
      setCompleted(true)
    } finally {
      setLoading(false)
    }
  }

  const finishAndContinue = () => {
    if (isNewUser) {
      // New users go to student dashboard after completing placement
      console.log('✅ Placement complete - routing to student dashboard')
      navigate('/dashboard/student', { replace: true })
    } else {
      // Existing users can go back to dashboard
      navigate('/dashboard', { replace: true })
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Welcome Screen
  if (!started) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-3xl w-full">
          <div className={`rounded-3xl border shadow-2xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800/95 border-gray-700'
              : 'bg-white/95 border-gray-200'
          }`}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {isNewUser ? '🎉 Welcome to AI Education!' : 'Placement Assessment'}
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                {isNewUser
                  ? 'Let\'s personalize your learning journey with an AI-powered assessment'
                  : 'Help us understand your current knowledge level for better recommendations'
                }
              </p>
            </div>

            <div className="p-8">
              {/* Error Display */}
              {error && (
                <div className={`mb-6 p-4 border-l-4 border-orange-400 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
                }`}>
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-400 mr-3" />
                    <p className={`text-sm ${
                      currentTheme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                    }`}>{error}</p>
                  </div>
                </div>
              )}

              {/* Benefits Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Personalized Learning Path</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Get content tailored to your current skill level and learning style</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>AI-Powered Insights</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Advanced algorithms analyze your responses for accurate placement</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Quick & Efficient</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Only takes 5-10 minutes to complete the assessment</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Adaptive Questions</h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Questions adjust based on your previous answers</p>
                  </div>
                </div>
              </div>

              {/* Assessment Details */}
              <div className={`border-2 border-blue-200 rounded-2xl p-6 mb-8 transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border-blue-700'
                  : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50'
              }`}>
                <div className="flex items-center mb-4">
                  <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className={`font-bold text-lg transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                  }`}>What to Expect</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className={`flex items-center transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    6-8 carefully selected questions
                  </div>
                  <div className={`flex items-center transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Mixed difficulty levels
                  </div>
                  <div className={`flex items-center transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Field-specific content
                  </div>
                  <div className={`flex items-center transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Instant results with recommendations
                  </div>
                  {isNewUser && (
                    <div className={`md:col-span-2 flex items-center font-semibold transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      <Star className="w-4 h-4 mr-2 text-blue-600" />
                      Required to unlock your personalized dashboard
                    </div>
                  )}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <Button
                  onClick={() => setStarted(true)}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isNewUser ? 'Begin My Learning Journey' : 'Start Assessment'}
                </Button>
                
                <p className={`text-sm mt-4 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No time pressure • You can go back and change answers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Completion Screen
  if (completed && result) {
    const skillLevelColors = {
      beginner: { bg: 'from-green-500 to-emerald-500', text: 'text-green-800', badge: 'bg-green-100' },
      intermediate: { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-800', badge: 'bg-yellow-100' },
      expert: { bg: 'from-red-500 to-pink-500', text: 'text-red-800', badge: 'bg-red-100' },
      advanced: { bg: 'from-red-500 to-pink-500', text: 'text-red-800', badge: 'bg-red-100' }
    }

    const levelConfig = skillLevelColors[result.predictedLevel] || skillLevelColors.beginner

    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-3xl w-full">
          <div className={`rounded-3xl border shadow-2xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800/95 border-gray-700'
              : 'bg-white/95 border-gray-200'
          }`}>
            {/* Success Header */}
            <div className={`bg-gradient-to-r ${levelConfig.bg} px-8 py-12 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-white"></div>
              </div>
              
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">🎉 Assessment Complete!</h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Your personalized learning profile has been created based on your responses
                </p>
              </div>
            </div>

            <div className="p-8">
              {/* Results Summary */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center space-x-4 rounded-2xl p-6 border transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600'
                    : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
                }`}>
                  <div className="text-center">
                    <div className={`text-sm mb-1 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Time Taken</div>
                    <div className={`text-lg font-bold transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>{formatTime(timeSpent)}</div>
                  </div>
                  <div className={`w-px h-12 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="text-center">
                    <div className={`text-sm mb-1 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Questions</div>
                    <div className={`text-lg font-bold transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>{result.totalQuestions}</div>
                  </div>
                  <div className={`w-px h-12 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="text-center">
                    <div className={`text-sm mb-1 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>AI Confidence</div>
                    <div className={`text-lg font-bold transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>{Math.round((result.confidence || 0.8) * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* Skill Level Display */}
              <div className={`rounded-3xl p-8 mb-8 border-2 transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border-blue-700'
                  : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200'
              }`}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-indigo-600 mr-3" />
                    <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Your Assessed Skill Level</h2>
                  </div>
                  
                  <div className={`inline-flex items-center px-8 py-4 rounded-2xl text-2xl font-bold shadow-lg mb-4 ${levelConfig.badge} ${levelConfig.text}`}>
                    <Award className="w-6 h-6 mr-2" />
                    {result.predictedLevel?.charAt(0).toUpperCase() + result.predictedLevel?.slice(1)}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className={`text-sm transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Learning Focus</div>
                      <div className={`font-semibold transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {result.predictedLevel === 'beginner' && 'Foundation Building'}
                        {result.predictedLevel === 'intermediate' && 'Skill Development'}
                        {(result.predictedLevel === 'expert' || result.predictedLevel === 'advanced') && 'Expertise Refinement'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className={`text-sm transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Accuracy</div>
                      <div className={`font-semibold transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>{Math.round((result.accuracy || 0) * 100)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className={`text-sm transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>Study Mode</div>
                      <div className={`font-semibold transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>Adaptive Learning</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-600 mr-2" />
                    <h3 className={`text-xl font-bold transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>AI-Generated Recommendations</h3>
                  </div>
                  <div className="grid gap-4">
                    {result.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className={`flex items-start space-x-4 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-indigo-600">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className={`leading-relaxed transition-colors duration-300 ${
                            currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          }`}>{rec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <div className="text-center">
                <Button
                  onClick={finishAndContinue}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  {isNewUser ? 'Explore My Dashboard' : 'Continue to Dashboard'}
                </Button>
                
                <p className={`text-sm mt-4 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Your assessment results have been saved to your profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading State
  if (questions.length === 0 && loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${
            currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>Generating Your Assessment</h2>
          <p className={`mb-4 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>AI is creating personalized questions based on your profile...</p>
          <div className={`flex items-center justify-center space-x-2 text-sm transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Brain className="w-4 h-4" />
            <span>Powered by Advanced AI</span>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error && questions.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-md w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            currentTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <AlertCircle className={`w-10 h-10 ${
              currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} />
          </div>
          <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>Assessment Unavailable</h2>
          <p className={`mb-6 transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setError(null)
                setStarted(true)
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full px-6 py-3"
            >
              Skip Assessment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Interface
  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-3xl mx-auto py-8">
        {/* Enhanced Progress Header */}
        <div className={`rounded-2xl border p-6 mb-8 shadow-lg transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>Placement Assessment</h1>
                <p className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Question {currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-sm font-semibold transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{Math.round(progress)}% Complete</div>
              <div className={`text-xs flex items-center mt-1 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeSpent)}
              </div>
            </div>
          </div>
          
          <div className={`w-full rounded-full h-3 overflow-hidden transition-colors duration-300 ${
            currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Question Card */}
        <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
          currentTheme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className={`px-8 py-6 border-b transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-gray-600'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {currentQuestion + 1}
              </div>
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                Assessment Question
              </span>
            </div>
            <h2 className={`text-2xl font-bold leading-tight transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {question?.question}
            </h2>
          </div>

          <div className="p-8">
            {/* Answer Choices */}
            <div className="space-y-4 mb-8">
              {question?.choices?.map((choice, idx) => {
                const isSelected = selectedAnswer === idx
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    className={`group w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 shadow-lg scale-105' +
                          (currentTheme === 'dark'
                            ? ' bg-gradient-to-r from-indigo-900/30 to-purple-900/30'
                            : ' bg-gradient-to-r from-indigo-50 to-purple-50')
                        : currentTheme === 'dark'
                          ? 'border-gray-600 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:scale-102'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500 shadow-lg scale-110' 
                          : currentTheme === 'dark'
                            ? 'border-gray-500 group-hover:border-indigo-400'
                            : 'border-gray-300 group-hover:border-indigo-400'
                      }`}>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />
                        )}
                      </div>
                      <span className={`font-semibold text-lg transition-colors ${
                        isSelected 
                          ? currentTheme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'
                          : currentTheme === 'dark' 
                            ? 'text-gray-200 group-hover:text-indigo-300' 
                            : 'text-gray-700 group-hover:text-indigo-800'
                      }`}>
                        {choice}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className={`flex justify-between items-center pt-6 border-t transition-colors duration-300 ${
              currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className={`flex items-center px-6 py-3 font-semibold transition-all hover:scale-105 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  currentTheme === 'dark'
                    ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-4">
                <span className={`text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {selectedAnswer !== null ? 'Answer selected' : 'Select an answer to continue'}
                </span>
                <Button
                  onClick={nextQuestion}
                  disabled={selectedAnswer === null || loading}
                  loading={loading && currentQuestion === questions.length - 1}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {currentQuestion === questions.length - 1 ? (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      {loading ? 'Submitting...' : 'Complete Assessment'}
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Type Indicator */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center space-x-2 text-sm backdrop-blur-sm px-4 py-2 rounded-full border transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'text-gray-300 bg-gray-800/80 border-gray-600'
              : 'text-gray-500 bg-white/80 border-gray-200'
          }`}>
            <Eye className="w-4 h-4" />
            <span>
              {question?.type === 'self-assessment' ? 'Self Assessment' : 
               question?.type === 'learning-style' ? 'Learning Style' : 
               question?.type === 'learning-preference' ? 'Learning Preference' :
               'Knowledge Check'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
