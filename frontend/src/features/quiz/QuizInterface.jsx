import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext' // ✅ Add ThemeContext
import Button from '../../components/ui/Button'
import { api } from '../../services/api'
import {
  Clock,
  Brain,
  Target,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Zap,
  BookOpen,
  BarChart3,
  Award,
  Timer,
  AlertCircle,
  Settings
} from 'lucide-react'

export default function QuizInterface() {
  const [state, setState] = useState('setup')
  const [loading, setLoading] = useState(false)
  const [quizId, setQuizId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [topic, setTopic] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [userSkillLevel, setUserSkillLevel] = useState('beginner')
  const [predictionConfidence, setPredictionConfidence] = useState(0)

  // Timer states
  const [timeLeft, setTimeLeft] = useState(45)
  const [timerActive, setTimerActive] = useState(false)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState([])

  const navigate = useNavigate()
  const { currentTheme } = useTheme() // ✅ Add theme hook
  const FIXED_TIME_PER_QUESTION = 45

  // Timer Effect
  useEffect(() => {
    let interval = null

    if (timerActive && timeLeft > 0 && state === 'taking') {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleTimeUp()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft, state])

  // Handle time up - auto-advance
  const handleTimeUp = useCallback(() => {
    console.log('⏰ Time up for question', currentQuestion + 1)

    const newTimeSpent = [...timeSpentPerQuestion]
    newTimeSpent[currentQuestion] = FIXED_TIME_PER_QUESTION
    setTimeSpentPerQuestion(newTimeSpent)

    if (currentQuestion < questions.length - 1) {
      moveToNextQuestion()
    } else {
      submitQuiz()
    }
  }, [currentQuestion, questions.length, timeSpentPerQuestion])

  // Move to next question with timer reset
  const moveToNextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1)
    setTimeLeft(FIXED_TIME_PER_QUESTION)
    setQuestionStartTime(Date.now())
    setTimerActive(timerEnabled)
  }

  // Load user's skill level
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const profileData = await api('/api/student/profile/me')
      const skillLevel = profileData.profile?.profile?.skillLevel || 'beginner'
      const confidence = profileData.lastPrediction?.confidence || 0
      setUserSkillLevel(skillLevel)
      setPredictionConfidence(confidence)
    } catch (error) {
      console.log('Could not fetch profile:', error.message)
      setUserSkillLevel('beginner')
      setPredictionConfidence(0.3)
    }
  }

  // ✅ KEEP YOUR EXISTING ENDPOINT - Just enhanced UI
  const startQuiz = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic for your quiz')
      return
    }

    setLoading(true)
    try {
      // ✅ Using your existing /api/quiz/generate endpoint
      const res = await api('/api/quiz/generate', {
        method: 'POST',
        body: {
          customTopic: topic.trim(),
          category: 'Education',
          questions: questionCount,
          choices: 4,
          language: 'English',
          difficulty: userSkillLevel // Use detected skill level
        },
      })

      setQuizId(res.quizId)
      setQuestions(res.quiz.questions || [])
      setAnswers(Array((res.quiz.questions || []).length).fill(null))
      setTimeSpentPerQuestion(Array((res.quiz.questions || []).length).fill(0))
      setCurrentQuestion(0)
      setTimeLeft(FIXED_TIME_PER_QUESTION)
      setQuestionStartTime(Date.now())
      setState('taking')

      // Start timer if enabled
      if (timerEnabled) {
        setTimerActive(true)
      }
    } catch (error) {
      console.error('Quiz generation failed:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Using your existing /api/quiz/submit endpoint
  // ✅ FIXED: Calculate score before submitting
  const submitQuiz = async () => {
    // Record final question time
    if (questionStartTime) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
      const newTimeSpent = [...timeSpentPerQuestion]
      newTimeSpent[currentQuestion] = Math.min(timeSpent, FIXED_TIME_PER_QUESTION)
      setTimeSpentPerQuestion(newTimeSpent)
    }

    // ✅ ADD: Calculate correct answers on frontend for display
    let correctCount = 0
    const answerDetails = answers.map((sel, i) => {
      const userAnswer = sel != null ? questions[i].choices[sel] : ''
      const correctAnswer = questions[i].answer
      const isCorrect = userAnswer === correctAnswer

      if (isCorrect) correctCount++

      return {
        index: i,
        answer: userAnswer
      }
    })

    const payload = {
      quizId,
      answers: answerDetails,
      // ✅ ADD: Include score calculation metadata
      correctAnswers: correctCount,  // Add this
      totalQuestions: questions.length,  // Add this
      // Include timing data
      timingData: {
        timePerQuestion: FIXED_TIME_PER_QUESTION,
        timeSpentPerQuestion: timeSpentPerQuestion,
        timerEnabled: timerEnabled,
        totalTimeSpent: timeSpentPerQuestion.reduce((a, b) => a + b, 0)
      }
    }

    setLoading(true)
    setTimerActive(false)

    try {
      const res = await api('/api/quiz/submit', { method: 'POST', body: payload })
      navigate(`/quiz/results/${res.attemptId}`, {
        state: {
          result: res,
          quizData: {
            topic: topic,
            totalQuestions: questions.length,
            correctAnswers: correctCount,  // ✅ ADD: Pass to results page
            percentage: res.percentage,  // ✅ ADD: Use backend calculated percentage
            quizId: quizId,
            timingData: payload.timingData,
            skillLevel: userSkillLevel,
            confidence: predictionConfidence
          }
        }
      })
    } catch (error) {
      console.error('Quiz submission failed:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)

    // Record time spent on this question
    if (questionStartTime) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
      const newTimeSpent = [...timeSpentPerQuestion]
      newTimeSpent[currentQuestion] = Math.min(timeSpent, FIXED_TIME_PER_QUESTION)
      setTimeSpentPerQuestion(newTimeSpent)
    }
  }

  const nextQuestion = () => {
    // Record time spent before moving
    if (questionStartTime) {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
      const newTimeSpent = [...timeSpentPerQuestion]
      newTimeSpent[currentQuestion] = Math.min(timeSpent, FIXED_TIME_PER_QUESTION)
      setTimeSpentPerQuestion(newTimeSpent)
    }

    moveToNextQuestion()
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setTimeLeft(FIXED_TIME_PER_QUESTION)
      setQuestionStartTime(Date.now())
      setTimerActive(timerEnabled)
    }
  }

  // Enhanced Timer Display with Theme Support
  const TimerDisplay = ({ timeLeft, timerEnabled }) => {
    if (!timerEnabled) return null

    const percentage = (timeLeft / FIXED_TIME_PER_QUESTION) * 100
    const isLowTime = timeLeft <= 10
    const isVeryLowTime = timeLeft <= 5

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Timer className={`w-5 h-5 ${isVeryLowTime ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-blue-600'}`} />
            <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Time Remaining</span>
          </div>
          <span className={`text-2xl font-bold ${isVeryLowTime ? 'text-red-600 animate-pulse' :
              isLowTime ? 'text-orange-600' :
                currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
            {timeLeft}s
          </span>
        </div>
        <div className={`w-full rounded-full h-3 shadow-inner transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${isVeryLowTime ? 'bg-gradient-to-r from-red-500 to-red-600' :
                isLowTime ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                  'bg-gradient-to-r from-green-500 to-blue-500'
              }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isLowTime && (
          <div className="flex items-center justify-center mt-2">
            <AlertCircle className="w-4 h-4 text-orange-600 mr-1" />
            <p className="text-sm text-orange-600 font-medium animate-pulse">
              Time running out!
            </p>
          </div>
        )}
      </div>
    )
  }

  const resetQuiz = () => {
    setState('setup')
    setQuizId(null)
    setQuestions([])
    setAnswers([])
    setCurrentQuestion(0)
    setTopic('')
    setQuestionCount(10)
    setTimerActive(false)
    setTimeLeft(FIXED_TIME_PER_QUESTION)
    setTimeSpentPerQuestion([])
  }

  // ✅ ENHANCED SETUP STATE with Theme Support
  if (state === 'setup') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}>
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className={`rounded-3xl border p-8 shadow-xl backdrop-blur-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            {/* Enhanced Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                🤖 AI Quiz Generator
              </h1>
              <p className={`text-xl mb-6 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                Create personalized quizzes with adaptive difficulty and ML-powered skill prediction
              </p>
              <div className="flex justify-center items-center space-x-4 flex-wrap">
                <span className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 text-green-300'
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800'
                  }`}>
                  ✨ Powered by Gemini Flash
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700 text-blue-300'
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-blue-800'
                  }`}>
                  🧠 ML Skill Prediction
                </span>
              </div>
            </div>

            {/* Enhanced Skill Level Display */}
            <div className={`mb-8 p-6 rounded-2xl border-2 transition-colors duration-300 ${currentTheme === 'dark'
                ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`}>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Target className={`w-5 h-5 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>Current Skill Level:</span>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${userSkillLevel === 'beginner'
                    ? currentTheme === 'dark'
                      ? 'bg-green-900/30 text-green-300 border-2 border-green-700'
                      : 'bg-green-100 text-green-800 border-2 border-green-300'
                    : userSkillLevel === 'intermediate'
                      ? currentTheme === 'dark'
                        ? 'bg-yellow-900/30 text-yellow-300 border-2 border-yellow-700'
                        : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                      : currentTheme === 'dark'
                        ? 'bg-red-900/30 text-red-300 border-2 border-red-700'
                        : 'bg-red-100 text-red-800 border-2 border-red-300'
                  }`}>
                  🎯 {userSkillLevel}
                </span>
                {predictionConfidence > 0 && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${currentTheme === 'dark'
                      ? 'bg-gray-800 border border-gray-600 text-gray-300'
                      : 'bg-white border border-blue-200 text-blue-700'
                    }`}>
                    {Math.round(predictionConfidence * 100)}% confidence
                  </span>
                )}
              </div>
              <p className={`text-sm text-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                }`}>
                Quiz difficulty will be automatically adjusted to your skill level
              </p>
            </div>

            {/* Enhanced Topic Input */}
            <div className="mb-8">
              <label className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                What topic would you like to practice?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && topic.trim()) {
                      startQuiz()
                    }
                  }}
                  placeholder=" e.g., Machine Learning, World History, Organic Chemistry"
                  className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg transition-all ${currentTheme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400'
                      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                    }`}
                  autoFocus
                />
                <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-sm mt-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                Enter any topic - our AI will generate questions at your skill level
              </p>
            </div>

            {/* Enhanced Question Count Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <label className={`text-lg font-semibold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                    Number of Questions
                  </label>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-purple-600">{questionCount}</span>
                  <div className="text-right">
                    <div className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>~{Math.round(questionCount * 0.75)} min</div>
                    <div className={`text-xs transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                      {questionCount >= 15 ? 'Comprehensive' : 'Quick'} Quiz
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-2">
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: currentTheme === 'dark'
                      ? `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((questionCount - 5) / 35) * 100}%, #374151 ${((questionCount - 5) / 35) * 100}%, #374151 100%)`
                      : `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((questionCount - 5) / 35) * 100}%, #E5E7EB ${((questionCount - 5) / 35) * 100}%, #E5E7EB 100%)`
                  }}
                />

                <div className={`flex justify-between text-xs mt-2 px-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  <span>5</span><span>15</span><span>25</span><span>35</span><span>40</span>
                </div>
              </div>
            </div>

            {/* Enhanced Timer Toggle */}
            <div className={`mb-10 p-6 border-2 rounded-2xl transition-colors duration-300 ${currentTheme === 'dark'
                ? 'border-gray-600 bg-gray-700/50'
                : 'border-gray-200 bg-gray-50'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className={`w-6 h-6 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  <div>
                    <label className={`text-lg font-semibold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>Enable Timer</label>
                    <p className={`text-sm mt-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      45 seconds per question • Auto-advance when time runs out • Improves ML prediction accuracy
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTimerEnabled(!timerEnabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${timerEnabled ? 'bg-indigo-600 shadow-lg' : currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md ${timerEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                </button>
              </div>
              {timerEnabled && (
                <div className={`mt-4 p-3 border rounded-lg transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-blue-900/20 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                  }`}>
                  <p className={`text-sm flex items-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                    <Award className="w-4 h-4 mr-2" />
                    Timer mode helps our ML system better predict your skill level
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Generate Button */}
            <div className="text-center">
              <Button
                onClick={startQuiz}
                loading={loading}
                className="px-12 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                disabled={!topic.trim()}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin -ml-1 mr-3 h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating {questionCount} AI Questions...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Brain className="mr-3" size={24} />
                    🚀 Generate {questionCount} Questions
                  </span>
                )}
              </Button>

              {topic.trim() && (
                <div className={`mt-6 p-4 rounded-xl border transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-700'
                    : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                  }`}>
                  <p className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                    }`}>
                    🎯 Ready to generate a <strong>{userSkillLevel}-level</strong> quiz on <strong>"{topic}"</strong>
                    {timerEnabled && " with 45s timer per question"}
                  </p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                    Press Enter or click to start your personalized quiz
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ ENHANCED TAKING STATE with Theme Support
  if (state === 'taking') {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100
    const isLastQuestion = currentQuestion === questions.length - 1
    const currentAnswer = answers[currentQuestion]

    return (
      <div className={`min-h-screen transition-colors duration-300 ${currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}>
        <div className="max-w-5xl mx-auto py-8 px-6">
          {/* Enhanced Header with Timer */}
          <div className={`rounded-2xl shadow-xl border p-8 mb-8 backdrop-blur-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className={`text-2xl font-bold mb-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>{topic}</h1>
                <div className={`flex items-center space-x-4 text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {userSkillLevel} level
                  </span>
                  <span className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {questions.length} questions
                  </span>
                  {timerEnabled && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      45s per question
                    </span>
                  )}
                  <span className="flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    AI Generated
                  </span>
                </div>
              </div>
              <button
                onClick={resetQuiz}
                className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 border rounded-lg transition-all ${currentTheme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>New Topic</span>
              </button>
            </div>

            {/* Enhanced Timer Display */}
            <TimerDisplay timeLeft={timeLeft} timerEnabled={timerEnabled} />

            {/* Enhanced Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Quiz Progress</span>
                <span className="text-sm font-medium text-indigo-600">
                  {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <div className={`w-full rounded-full h-3 shadow-inner transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={`flex justify-between text-xs mt-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                <span>Started</span>
                <span>{Math.round(progress)}% Complete</span>
                <span>Finish</span>
              </div>
            </div>
          </div>

          {/* Enhanced Question Display */}
          <div className={`rounded-2xl shadow-xl border p-10 transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold px-4 py-2 rounded-full text-sm">
                    Question {currentQuestion + 1}
                  </span>
                  {question?.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${question.difficulty === 'beginner'
                        ? currentTheme === 'dark'
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-green-100 text-green-700'
                        : question.difficulty === 'intermediate'
                          ? currentTheme === 'dark'
                            ? 'bg-yellow-900/30 text-yellow-300'
                            : 'bg-yellow-100 text-yellow-700'
                          : currentTheme === 'dark'
                            ? 'bg-red-900/30 text-red-300'
                            : 'bg-red-100 text-red-700'
                      }`}>
                      {question.difficulty}
                    </span>
                  )}
                </div>
                {currentAnswer !== null && (
                  <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentTheme === 'dark'
                      ? 'text-green-300 bg-green-900/30'
                      : 'text-green-600 bg-green-100'
                    }`}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Answered
                  </span>
                )}
              </div>
              <h2 className={`text-2xl font-semibold leading-relaxed mb-4 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                {question?.question}
              </h2>
              <p className={`text-sm mb-6 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                Multiple choice • Select the best answer
              </p>
            </div>

            {/* Enhanced Answer Choices */}
            <div className="space-y-4 mb-10">
              {question?.choices?.map((choice, idx) => {
                const isSelected = currentAnswer === idx
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${isSelected
                        ? currentTheme === 'dark'
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 text-indigo-300 shadow-lg transform scale-[1.02]'
                          : 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900 shadow-lg transform scale-[1.02]'
                        : currentTheme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 hover:shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${isSelected
                          ? 'border-indigo-500 bg-indigo-500'
                          : currentTheme === 'dark'
                            ? 'border-gray-500'
                            : 'border-gray-300'
                        }`}>
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                      </div>
                      <span className={`text-lg font-medium flex-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                        {choice}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Enhanced Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className={`flex items-center space-x-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed border rounded-xl transition-all ${currentTheme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-4">
                <span className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  {answers.filter(a => a !== null).length} / {questions.length} answered
                </span>

                {!isLastQuestion ? (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <Button
                    onClick={submitQuiz}
                    loading={loading}
                    className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Submitting Quiz...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Award className="mr-2" size={20} />
                        Submit Quiz
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
