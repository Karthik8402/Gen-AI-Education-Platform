import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { useTheme } from '@/context/ThemeContext'
import {
  Trophy,
  Target,
  Clock,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  RefreshCw,
  History,
  Home,
  Brain,
  Zap,
  BookOpen,
  Star,
  AlertCircle,
  ChevronRight,
  Download,
  Share2
} from 'lucide-react'

export default function QuizResults() {
  const { attemptId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentTheme } = useTheme() // ✅ Use ThemeContext properly
  
  const [result, setResult] = useState(location.state?.result || null)
  const [quizData, setQuizData] = useState(location.state?.quizData || null)
  const [loading, setLoading] = useState(!result)
  const [skillPrediction, setSkillPrediction] = useState(null)

  // If result not passed via navigation state, fetch it from API
  useEffect(() => {
    if (!result && attemptId) {
      fetchQuizResult()
    }
  }, [attemptId, result])

  const fetchQuizResult = async () => {
    try {
      setLoading(true)
      const res = await api(`/api/quiz/attempts/${attemptId}`)
      setResult(res)
      
      // Try to fetch skill prediction data if available
      try {
        const profileRes = await api('/api/student/profile/me')
        setSkillPrediction(profileRes.lastPrediction)
      } catch (error) {
        console.log('Could not fetch skill prediction:', error)
      }
    } catch (error) {
      console.error('Failed to fetch quiz result:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-4xl mx-auto py-12">
          <div className={`rounded-3xl border p-12 shadow-xl text-center backdrop-blur-sm transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-6"></div>
            <h2 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>Analyzing Your Performance</h2>
            <p className={`transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Processing quiz results and updating skill predictions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-4xl mx-auto py-12">
          <div className={`rounded-3xl border p-12 shadow-xl text-center backdrop-blur-sm transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>Results Not Found</h2>
            <p className={`mb-8 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>We couldn't find the results for this quiz attempt.</p>
            <button
              onClick={() => navigate('/quiz/interface')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Take New Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  const score = result.score || {}
  const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
  const passed = percentage >= 70
  const isExcellent = percentage >= 90
  const isGood = percentage >= 70
  const details = result.detail || []
  const topic = quizData?.topic || result.topic || 'Quiz'
  const difficulty = quizData?.skillLevel || result.difficulty || 'beginner'

  // Performance analysis
  const correctAnswers = details.filter(d => d.isCorrect).length
  const incorrectAnswers = details.filter(d => !d.isCorrect).length
  const unanswered = details.filter(d => !d.userAnswer || d.userAnswer === '—').length

  // Time analysis (if available)
  const timingData = quizData?.timingData
  const avgTimePerQuestion = timingData?.totalTimeSpent ? Math.round(timingData.totalTimeSpent / score.total) : null

  // Skill level assessment
  const getSkillLevelFromScore = (score) => {
    if (score >= 85) return 'expert'
    if (score >= 60) return 'intermediate'
    return 'beginner'
  }

  const assessedLevel = getSkillLevelFromScore(percentage)
  const levelProgression = difficulty !== assessedLevel

  // Performance insights
  const getPerformanceInsights = () => {
    const insights = []
    
    if (percentage >= 90) {
      insights.push("🎉 Outstanding performance! You've mastered this topic.")
    } else if (percentage >= 70) {
      insights.push("👏 Great job! You have a solid understanding of the topic.")
    } else if (percentage >= 50) {
      insights.push("📚 Good effort! Review the topics you missed to improve.")
    } else {
      insights.push("💪 Keep practicing! Focus on the fundamentals to build your knowledge.")
    }

    if (unanswered > 0) {
      insights.push(`⚠️ You left ${unanswered} question${unanswered > 1 ? 's' : ''} unanswered.`)
    }

    if (levelProgression) {
      if (assessedLevel === 'expert' && difficulty === 'intermediate') {
        insights.push("🚀 Excellent! You're ready for expert-level challenges.")
      } else if (assessedLevel === 'intermediate' && difficulty === 'beginner') {
        insights.push("📈 Great progress! You're advancing to intermediate level.")
      }
    }

    return insights
  }

  const performanceInsights = getPerformanceInsights()

  const shareResults = () => {
    const shareText = `🎯 Just completed a ${topic} quiz!\n📊 Score: ${percentage}% (${score.correct}/${score.total})\n🎓 Level: ${difficulty}\n\n#AILearning #Quiz`
    
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Results',
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Results copied to clipboard!')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
        
        {/* Enhanced Results Header */}
        <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`h-2 ${isExcellent ? 'bg-gradient-to-r from-green-400 to-emerald-500' : isGood ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}></div>
          
          <div className="p-10">
            <div className="text-center">
              {/* Enhanced Success Icon */}
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                isExcellent ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600' :
                isGood ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600' :
                'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-600'
              }`}>
                {isExcellent ? (
                  <Trophy className="w-12 h-12" />
                ) : isGood ? (
                  <Award className="w-12 h-12" />
                ) : (
                  <Target className="w-12 h-12" />
                )}
              </div>
              
              {/* Results Title */}
              <h1 className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {isExcellent ? 'Outstanding!' : isGood ? 'Great Job!' : 'Quiz Complete!'}
              </h1>
              
              <div className="mb-6">
                <h2 className={`text-xl mb-2 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>{topic}</h2>
                <div className={`flex items-center justify-center space-x-4 text-sm transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {difficulty} level
                  </span>
                  <span className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {score.total} questions
                  </span>
                  {avgTimePerQuestion && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      ~{avgTimePerQuestion}s/question
                    </span>
                  )}
                </div>
              </div>
              
              {/* Enhanced Score Display */}
              <div className="text-8xl font-bold mb-4">
                <span className={
                  isExcellent ? 'text-green-600' :
                  isGood ? 'text-blue-600' :
                  'text-yellow-600'
                }>
                  {score.correct}
                </span>
                <span className={`transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-300'
                }`}> / </span>
                <span className={`transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{score.total}</span>
              </div>
              
              <div className={`text-3xl font-bold mb-6 ${
                isExcellent ? 'text-green-600' :
                isGood ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {percentage}%
              </div>
              
              {/* Enhanced Status Badge */}
              <div className={`inline-flex items-center px-8 py-3 rounded-full text-lg font-bold shadow-lg ${
                isExcellent 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                  : isGood
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : percentage >= 50
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              }`}>
                {isExcellent ? (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    Master Level Performance!
                  </>
                ) : isGood ? (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    Excellent Work!
                  </>
                ) : percentage >= 50 ? (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Good Effort!
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Keep Practicing!
                  </>
                )}
              </div>

              {/* Share Button */}
              <div className="mt-6">
                <button
                  onClick={shareResults}
                  className={`inline-flex items-center px-4 py-2 border rounded-lg transition-all ${
                    currentTheme === 'dark'
                      ? 'text-gray-300 hover:text-gray-100 border-gray-600 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Correct Answers */}
          <div className={`rounded-2xl border p-6 shadow-lg transition-colors duration-300 ${
            currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Correct</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Answers</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{correctAnswers}</span>
            </div>
            <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(correctAnswers / score.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Incorrect Answers */}
          <div className={`rounded-2xl border p-6 shadow-lg transition-colors duration-300 ${
            currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Incorrect</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Answers</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">{incorrectAnswers}</span>
            </div>
            <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(incorrectAnswers / score.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Skill Assessment */}
          <div className={`rounded-2xl border p-6 shadow-lg transition-colors duration-300 ${
            currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Brain className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Assessed Level</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Based on performance</p>
                </div>
              </div>
              <span className={`text-lg font-bold capitalize px-3 py-1 rounded-full ${
                assessedLevel === 'expert' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                assessedLevel === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              }`}>
                {assessedLevel}
              </span>
            </div>
            {levelProgression && (
              <div className="flex items-center text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 p-2 rounded-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                Level progression detected!
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className={`rounded-2xl border p-8 shadow-lg transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <Zap className="w-6 h-6 text-yellow-500 mr-3" />
            Performance Insights
          </h2>
          <div className="space-y-4">
            {performanceInsights.map((insight, index) => (
              <div key={index} className={`flex items-start p-4 rounded-xl border transition-colors duration-300 ${
                currentTheme === 'dark'
                  ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`}>
                <div className="text-blue-600 mr-3 mt-0.5">
                  <span className="text-lg">{insight.charAt(0)}</span>
                </div>
                <p className={`flex-1 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>{insight.slice(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className={`rounded-2xl border p-8 shadow-lg transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
            Question Review
          </h2>
          <div className="space-y-6">
            {details.map((d, i) => (
              <div key={i} className={`rounded-xl border-2 p-6 transition-all ${
                d.isCorrect 
                  ? currentTheme === 'dark'
                    ? 'border-green-700 bg-gradient-to-r from-green-900/20 to-emerald-900/20'
                    : 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
                  : currentTheme === 'dark'
                    ? 'border-red-700 bg-gradient-to-r from-red-900/20 to-pink-900/20'
                    : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`font-semibold text-lg flex items-center transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold mr-3 transition-colors duration-300 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      Q{i + 1}
                    </span>
                    {d.question}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold ${
                    d.isCorrect 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
                  }`}>
                    {d.isCorrect ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Incorrect
                      </>
                    )}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {!d.isCorrect && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                        currentTheme === 'dark'
                          ? 'bg-red-900/20 border-red-700'
                          : 'bg-red-100 border-red-200'
                      }`}>
                        <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                          currentTheme === 'dark' ? 'text-red-300' : 'text-red-800'
                        }`}>Your Answer:</p>
                        <p className={`font-semibold transition-colors duration-300 ${
                          currentTheme === 'dark' ? 'text-red-200' : 'text-red-700'
                        }`}>
                          {d.userAnswer || 'No answer selected'}
                        </p>
                      </div>
                      <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                        currentTheme === 'dark'
                          ? 'bg-green-900/20 border-green-700'
                          : 'bg-green-100 border-green-200'
                      }`}>
                        <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                          currentTheme === 'dark' ? 'text-green-300' : 'text-green-800'
                        }`}>Correct Answer:</p>
                        <p className={`font-semibold transition-colors duration-300 ${
                          currentTheme === 'dark' ? 'text-green-200' : 'text-green-700'
                        }`}>{d.correctAnswer}</p>
                      </div>
                    </div>
                  )}
                  
                  {d.explanation && (
                    <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                      currentTheme === 'dark'
                        ? 'bg-blue-900/20 border-blue-700'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className={`text-sm font-medium mb-1 flex items-center transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        <Brain className="w-4 h-4 mr-1" />
                        Explanation:
                      </p>
                      <p className={`transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                      }`}>{d.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className={`rounded-2xl border p-8 shadow-lg transition-colors duration-300 ${
          currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 text-center transition-colors duration-300 ${
            currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/quiz/interface')}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Take Another Quiz
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
            
            <button
              onClick={() => navigate('/quiz/history')}
              className={`flex items-center justify-center px-8 py-4 border-2 rounded-xl font-semibold transition-all duration-200 ${
                currentTheme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <History className="w-5 h-5 mr-2" />
              View Quiz History
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center justify-center px-8 py-4 border-2 rounded-xl font-semibold transition-all duration-200 ${
                currentTheme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
          
          {/* Additional Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/content-generator')}
              className={`inline-flex items-center px-6 py-3 font-medium transition-all ${
                currentTheme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Study This Topic
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className={`inline-flex items-center px-6 py-3 font-medium transition-all ${
                currentTheme === 'dark'
                  ? 'text-green-400 hover:text-green-300'
                  : 'text-green-600 hover:text-green-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
