import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import {
  Copy,
  Download,
  RefreshCw,
  BookOpen,
  Code2,
  Brain,
  Lightbulb,
  PlayCircle,
  CheckCircle,
  XCircle,
  FileText,
  Zap,
  Target,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

// ============================================
// QUIZ QUESTION COMPONENT
// ============================================
const EnhancedQuizQuestion = ({ question, questionNumber, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const { currentTheme } = useTheme()

  const handleSubmit = () => {
    const correct = selectedAnswer === question.answer
    setIsCorrect(correct)
    setShowExplanation(true)
    onAnswer(selectedAnswer, correct)
  }

  const getChoiceIcon = (choice) => {
    if (!showExplanation) return null
    if (choice === question.answer) return <CheckCircle className="text-green-500" size={16} />
    if (choice === selectedAnswer && !isCorrect) return <XCircle className="text-red-500" size={16} />
    return null
  }

  return (
    <div className={`rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-200 ${currentTheme === 'dark'
      ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700'
      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className={`font-semibold text-lg pr-4 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
          <span className={`px-2 py-1 rounded-full text-sm mr-2 ${currentTheme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
            }`}>
            Q{questionNumber}
          </span>
          {question.question}
        </h4>
      </div>

      <div className="space-y-3 mb-4">
        {question.choices?.map((choice, idx) => (
          <label
            key={idx}
            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 ${selectedAnswer === choice
              ? currentTheme === 'dark'
                ? 'bg-blue-900/30 border-blue-600 ring-2 ring-blue-500/30'
                : 'bg-blue-100 border-blue-300 ring-2 ring-blue-200'
              : currentTheme === 'dark'
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                : 'bg-white border-gray-200 hover:bg-gray-50'
              } ${showExplanation ? 'pointer-events-none' : ''}`}
          >
            <input
              type="radio"
              name={`question-${questionNumber}`}
              value={choice}
              checked={selectedAnswer === choice}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="form-radio text-blue-600 w-4 h-4"
              disabled={showExplanation}
            />
            <span className={`flex-1 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {choice}
            </span>
            {getChoiceIcon(choice)}
          </label>
        ))}
      </div>

      {!showExplanation && selectedAnswer && (
        <button
          onClick={handleSubmit}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center justify-center"
        >
          <PlayCircle className="mr-2" size={16} />
          Check My Answer
        </button>
      )}

      {showExplanation && (
        <div className={`mt-4 p-4 rounded-lg border-l-4 ${isCorrect
          ? currentTheme === 'dark'
            ? 'bg-green-900/20 border-green-500 text-green-300'
            : 'bg-green-50 border-green-400 text-green-800'
          : currentTheme === 'dark'
            ? 'bg-red-900/20 border-red-500 text-red-300'
            : 'bg-red-50 border-red-400 text-red-800'
          }`}>
          <div className="flex items-center mb-2">
            {isCorrect ? (
              <CheckCircle className="mr-2 text-green-600" size={20} />
            ) : (
              <XCircle className="mr-2 text-red-600" size={20} />
            )}
            <p className="font-semibold">
              {isCorrect ? '🎉 Excellent! Correct!' : '🤔 Not quite right!'}
            </p>
          </div>
          <p className="mb-2">
            <strong>Correct Answer:</strong> {question.answer}
          </p>
          {question.explanation && (
            <div className={`mt-3 p-3 rounded border ${currentTheme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
              }`}>
              <p><strong>💡 Explanation:</strong> {question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// CONTENT TAB COMPONENT
// ============================================
const ContentTab = ({ icon: Icon, label, isActive, onClick, badge }) => {
  const { currentTheme } = useTheme()

  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${isActive
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
        : currentTheme === 'dark'
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

// ============================================
// CONTENT BLOCK WITH BEAUTIFUL FORMATTING
// ============================================
const ContentBlock = ({ content, title = 'Content' }) => {
  const [copied, setCopied] = useState(false)
  const { currentTheme } = useTheme()

  const copyContent = () => {
    navigator.clipboard.writeText(content || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = content ? content.split(/\s+/).filter(w => w.length > 0).length : 0

  if (!content || content.trim().length === 0) {
    return (
      <div className={`rounded-lg border p-8 text-center ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
        <p className={`${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No content available for this section
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
      }`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-6 py-4 border-b ${currentTheme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
        <div className="flex items-center space-x-3">
          <FileText className={`w-5 h-5 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-sm font-semibold ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
            {title}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentTheme === 'dark'
            ? 'bg-blue-900/30 text-blue-300'
            : 'bg-blue-100 text-blue-700'
            }`}>
            {wordCount} words
          </span>
        </div>
        <button
          onClick={copyContent}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentTheme === 'dark'
            ? 'text-gray-300 hover:text-white hover:bg-gray-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
          <Copy size={16} />
          <span>{copied ? '✓ Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Content with Beautiful Markdown Rendering */}
      <div className="p-8 overflow-y-auto max-h-[700px]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // H2 Headings
            h2: ({ children }) => (
              <h2 className={`text-2xl font-bold mb-4 mt-8 first:mt-0 flex items-center ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></span>
                {children}
              </h2>
            ),
            // H3 Headings
            h3: ({ children }) => (
              <h3 className={`text-xl font-semibold mb-3 mt-6 ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                {children}
              </h3>
            ),
            // H4 Headings
            h4: ({ children }) => (
              <h4 className={`text-lg font-semibold mb-2 mt-4 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                {children}
              </h4>
            ),
            // Paragraphs
            p: ({ children }) => (
              <p className={`mb-4 leading-relaxed text-base ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                {children}
              </p>
            ),
            // Unordered Lists
            ul: ({ children }) => (
              <ul className="space-y-3 my-5 ml-2">
                {children}
              </ul>
            ),
            // Ordered Lists
            ol: ({ children }) => (
              <ol className="space-y-3 my-5 ml-6 list-decimal">
                {children}
              </ol>
            ),
            // List Items
            li: ({ children }) => (
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
                <span className={`flex-1 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {children}
                </span>
              </li>
            ),
            // Bold/Strong
            strong: ({ children }) => (
              <strong className={`font-bold ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                {children}
              </strong>
            ),
            // Inline Code
            code: ({ inline, className, children }) => {
              const match = /language-(\w+)/.exec(className || '')

              if (!inline && match) {
                // Code Block
                return (
                  <div className="my-6">
                    <SyntaxHighlighter
                      style={currentTheme === 'dark' ? vscDarkPlus : vs}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        fontSize: '0.9rem'
                      }}
                      showLineNumbers={true}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                )
              }

              // Inline code
              return (
                <code className={`px-2 py-1 rounded text-sm font-mono ${currentTheme === 'dark'
                  ? 'bg-blue-900/30 text-blue-300'
                  : 'bg-blue-100 text-blue-800'
                  }`}>
                  {children}
                </code>
              )
            },
            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote className={`border-l-4 pl-6 py-3 my-6 italic ${currentTheme === 'dark'
                ? 'border-blue-500 bg-blue-900/10 text-blue-200'
                : 'border-blue-500 bg-blue-50 text-blue-900'
                }`}>
                {children}
              </blockquote>
            ),
            // Links
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            // Horizontal Rule
            hr: () => (
              <hr className={`my-8 border-t-2 ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`} />
            ),
            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className={`min-w-full border rounded-lg ${currentTheme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className={`px-6 py-3 border font-semibold text-left ${currentTheme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className={`px-6 py-4 border ${currentTheme === 'dark'
                ? 'border-gray-600 text-gray-300'
                : 'border-gray-300 text-gray-700'
                }`}>
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

// ============================================
// MAIN CONTENT GENERATOR COMPONENT
// ============================================
export default function ContentGenerator() {
  const [userProfile, setUserProfile] = useState(null)
  const [form, setForm] = useState({
    topic: '',
    contentType: 'explanation',
    difficulty: ''
  })
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizScore, setQuizScore] = useState(null)
  const [activeTab, setActiveTab] = useState('explanation')
  const { currentTheme } = useTheme()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await api('/api/auth/me')
        setUserProfile(data)
      } catch (err) {
        console.log('Could not fetch profile:', err.message)
      }
    }
    fetchProfile()
  }, [])

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const generateContent = async () => {
    if (!form.topic.trim()) return setError('Please enter a topic')

    setLoading(true)
    setError('')
    setContent(null)
    setQuizAnswers({})
    setQuizScore(null)

    try {
      const API_URL = import.meta.env.VITE_API_URL
      const token = localStorage.getItem('token')

      if (!token) {
        setError('No authentication token found. Please login again.')
        setTimeout(() => window.location.href = '/login', 2000)
        return
      }

      const response = await fetch(`${API_URL}/api/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          throw new Error('Session expired. Please login again.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Process content data
      let processedData = data
      if (data.content) {
        processedData = {
          ...data,
          content: {
            ...data.content,
            explanation: data.content.explanation || data.content.detailed_explanation || '',
            example: data.content.example || data.content.examples || '',
            exercise: data.content.exercise || data.content.exercises || '',
            learning_tip: data.content.learning_tip || data.content.learning_tips || '',
            quiz_questions: data.content.quiz_questions || []
          }
        }
      }

      if (processedData.content?.quiz_questions) {
        processedData.content.quiz_questions = cleanQuizQuestions(processedData.content.quiz_questions)
      }

      setContent(processedData)
      setActiveTab('explanation')

    } catch (err) {
      console.error('Content generation error:', err)
      setError(err.message || 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  const cleanQuizQuestions = (rawQuestions) => {
    if (!Array.isArray(rawQuestions)) return []

    return rawQuestions
      .filter(q => {
        return (
          q.question &&
          q.question.trim().length > 10 &&
          Array.isArray(q.choices) &&
          q.choices.length >= 2 &&
          q.answer &&
          q.answer.trim().length > 0
        )
      })
      .map(q => ({
        ...q,
        question: q.question.replace(/\*\*/g, '').trim(),
        answer: q.answer.replace(/\*\*/g, '').trim(),
        choices: q.choices.filter(choice => choice && choice.trim().length > 0),
        explanation: (q.explanation || '').replace(/\*\*/g, '').trim()
      }))
  }

  const handleQuizAnswer = (questionIndex, selectedAnswer, isCorrect) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: { selectedAnswer, isCorrect }
    }))

    const totalQuestions = content?.content?.quiz_questions?.length || 0
    const answeredQuestions = Object.keys({ ...quizAnswers, [questionIndex]: { selectedAnswer, isCorrect } }).length

    if (answeredQuestions === totalQuestions) {
      const correctAnswers = Object.values({ ...quizAnswers, [questionIndex]: { selectedAnswer, isCorrect } })
        .filter(answer => answer.isCorrect).length

      setQuizScore({
        correct: correctAnswers,
        total: totalQuestions,
        percentage: Math.round((correctAnswers / totalQuestions) * 100)
      })
    }
  }

  const copyAllContent = () => {
    if (!content?.content) return

    const textContent = `
🎓 TOPIC: ${content.content?.topic || form.topic}

📖 EXPLANATION:
${content.content?.explanation || ''}

💡 EXAMPLES:
${content.content?.example || ''}

🎯 EXERCISES:
${content.content?.exercise || ''}

💡 LEARNING TIPS:
${content.content?.learning_tip || ''}
    `.trim()

    navigator.clipboard.writeText(textContent).then(() => {
      alert('Complete content copied to clipboard! 📋')
    })
  }

  const downloadContent = () => {
    if (!content?.content) return

    const textContent = `
# ${content.content?.topic || form.topic} - AI Generated Learning Content

**Level:** ${content.content?.predicted_level?.toUpperCase() || 'BEGINNER'}
**Generated:** ${new Date().toLocaleDateString()}

## Comprehensive Explanation
${content.content?.explanation || ''}

## Practical Examples
${content.content?.example || ''}

## Practice Exercises
${content.content?.exercise || ''}

## Learning Tips
${content.content?.learning_tip || ''}

---
Generated by AI-Powered Educational Content Generator
    `.trim()

    const blob = new Blob([textContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(content.content?.topic || form.topic).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_content.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const predictedSkill = content?.content?.predicted_level || userProfile?.stats?.skillLevel || 'beginner'
  const predictionConfidence = content?.content?.prediction_confidence || 0

  const tabs = [
    {
      key: 'explanation',
      label: 'Explanation',
      icon: BookOpen,
      content: content?.content?.explanation
    },
    {
      key: 'example',
      label: 'Examples',
      icon: Code2,
      content: content?.content?.example
    },
    {
      key: 'exercise',
      label: 'Exercises',
      icon: Brain,
      content: content?.content?.exercise
    },
    {
      key: 'quiz',
      label: 'Assessment',
      icon: Target,
      badge: content?.content?.quiz_questions?.length || 0
    },
    {
      key: 'tips',
      label: 'Learning Tips',
      icon: Lightbulb,
      content: content?.content?.learning_tip
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${currentTheme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Content Generator
          </h1>
          <p className={`text-xl max-w-3xl mx-auto mb-6 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
            Generate personalized learning content with comprehensive quizzes powered by AI
          </p>
          <div className="flex justify-center items-center flex-wrap gap-4">
            <div className={`flex items-center px-4 py-2 border rounded-full shadow-sm ${currentTheme === 'dark' ? 'bg-gray-800 border-blue-700' : 'bg-white border-blue-200'
              }`}>
              <Target className="w-4 h-4 text-blue-600 mr-2" />
              <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Predicted Level: <span className="text-blue-600">{predictedSkill.toUpperCase()}</span>
              </span>
              {predictionConfidence > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                  {Math.round(predictionConfidence * 100)}% confidence
                </span>
              )}
            </div>
            <div className={`flex items-center px-4 py-2 border rounded-full shadow-sm ${currentTheme === 'dark' ? 'bg-gray-800 border-green-700' : 'bg-white border-green-200'
              }`}>
              <Zap className="w-4 h-4 text-green-600 mr-2" />
              <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Powered by Gemini Flash</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`rounded-3xl border p-8 shadow-xl mb-8 backdrop-blur-sm ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <label className={`text-lg font-semibold mb-4 flex items-center ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                What would you like to learn today?
              </label>
              <input
                name="topic"
                value={form.topic}
                onChange={onChange}
                placeholder="Search for any topic, e.g., Machine Learning, React, Data Structures..."
                className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg transition-all ${currentTheme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400'
                  : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                  }`}
              />
            </div>

            <div>
              <label className={`text-lg font-semibold mb-4 flex items-center ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                Content Focus
              </label>
              <select
                name="contentType"
                value={form.contentType}
                onChange={onChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-lg transition-all ${currentTheme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-gray-100'
                  : 'border-gray-200 bg-white text-gray-900'
                  }`}
              >
                <option value="explanation">📖 Comprehensive Explanation</option>
                <option value="examples">💡 Practical Examples</option>
                <option value="notes">📝 Study Notes</option>
                <option value="tutorial">🎯 Step-by-Step Tutorial</option>
              </select>
            </div>

            <div>
              <label className={`text-lg font-semibold mb-4 flex items-center ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={onChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-lg transition-all ${currentTheme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-gray-100'
                  : 'border-gray-200 bg-white text-gray-900'
                  }`}
              >
                <option value="">🤖 Auto-Predict (Recommended)</option>
                <option value="beginner">🟢 Beginner Friendly</option>
                <option value="intermediate">🔵 Intermediate Level</option>
                <option value="expert">🔴 Advanced/Expert</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>18 Questions</div>
                <div className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>Comprehensive Assessment</div>
              </div>
            </div>
          </div>

          {error && (
            <div className={`mt-8 p-6 border-2 rounded-xl flex items-start ${currentTheme === 'dark'
              ? 'bg-red-900/20 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
              }`}>
              <XCircle className="mr-3 text-red-500 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-lg">Generation Failed</p>
                <p className={currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'}>{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={generateContent}
            disabled={loading || !form.topic.trim()}
            className="mt-8 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-5 px-8 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
          >
            {loading && (
              <div className="mr-3 h-7 w-7 animate-spin rounded-full border-3 border-white border-t-transparent" />
            )}
            {loading ? (
              <span className="flex items-center">
                <Zap className="mr-2" size={20} />
                Generating Personalized Content...
              </span>
            ) : (
              <span className="flex items-center">
                <Brain className="mr-2" size={20} />
                Generate AI-Powered Content
              </span>
            )}
          </button>
        </div>

        {/* Generated Content Display */}
        {content && (
          <div className="space-y-8">
            <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500"></div>

              <div className="p-8">
                {/* Header Info */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-8">
                  <div className="mb-6 xl:mb-0">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-3xl font-bold ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                          {content.content?.topic || form.topic}
                        </h2>
                        <p className={`mt-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>AI-Generated Learning Content</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className={`flex items-center px-4 py-2 border rounded-full ${currentTheme === 'dark'
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700'
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200'
                        }`}>
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-green-300' : 'text-green-800'
                          }`}>AI Generated</span>
                      </div>

                      {content.content?.word_count && (
                        <div className={`flex items-center px-4 py-2 border rounded-full ${currentTheme === 'dark'
                          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700'
                          : 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200'
                          }`}>
                          <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
                          <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                            }`}>
                            {content.content.word_count} words
                          </span>
                        </div>
                      )}

                      {content.content?.quiz_questions?.length > 0 && (
                        <div className={`flex items-center px-4 py-2 border rounded-full ${currentTheme === 'dark'
                          ? 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-700'
                          : 'bg-gradient-to-r from-red-100 to-pink-100 border-red-200'
                          }`}>
                          <Award className="w-4 h-4 text-red-600 mr-2" />
                          <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-red-300' : 'text-red-800'
                            }`}>
                            {content.content.quiz_questions.length} Assessment Questions
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={copyAllContent}
                      className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${currentTheme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <Copy className="mr-2" size={16} />
                      Copy All
                    </button>
                    <button
                      onClick={downloadContent}
                      className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${currentTheme === 'dark'
                        ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                      <Download className="mr-2" size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        setContent(null)
                        setActiveTab('explanation')
                        setQuizAnswers({})
                        setQuizScore(null)
                      }}
                      className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${currentTheme === 'dark'
                        ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      <RefreshCw className="mr-2" size={16} />
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {tabs.map((tab) => (
                    <ContentTab
                      key={tab.key}
                      icon={tab.icon}
                      label={tab.label}
                      isActive={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      badge={tab.badge}
                    />
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'explanation' && (
                    <ContentBlock
                      content={content.content?.explanation}
                      title="Detailed Explanation"
                    />
                  )}

                  {activeTab === 'example' && (
                    <ContentBlock
                      content={content.content?.example}
                      title="Practical Examples"
                    />
                  )}

                  {activeTab === 'exercise' && (
                    <ContentBlock
                      content={content.content?.exercise}
                      title="Practice Exercises"
                    />
                  )}

                  {activeTab === 'tips' && (
                    <ContentBlock
                      content={content.content?.learning_tip}
                      title="Learning Tips"
                    />
                  )}

                  {activeTab === 'quiz' && (
                    <div className="space-y-6">
                      <div className={`rounded-xl border p-6 ${currentTheme === 'dark'
                        ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-700'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                        }`}>
                        <h3 className={`text-2xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                          }`}>
                          📝 Assessment Quiz
                        </h3>
                        <p className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Test your understanding with {content.content?.quiz_questions?.length || 0} questions
                        </p>
                      </div>

                      {content.content?.quiz_questions?.map((question, index) => (
                        <EnhancedQuizQuestion
                          key={index}
                          question={question}
                          questionNumber={index + 1}
                          onAnswer={(answer, correct) => handleQuizAnswer(index, answer, correct)}
                        />
                      ))}

                      {quizScore && (
                        <div className={`rounded-xl border p-8 text-center ${quizScore.percentage >= 70
                          ? currentTheme === 'dark'
                            ? 'bg-green-900/20 border-green-700'
                            : 'bg-green-50 border-green-200'
                          : currentTheme === 'dark'
                            ? 'bg-orange-900/20 border-orange-700'
                            : 'bg-orange-50 border-orange-200'
                          }`}>
                          <Award className={`w-16 h-16 mx-auto mb-4 ${quizScore.percentage >= 70 ? 'text-green-500' : 'text-orange-500'
                            }`} />
                          <h3 className={`text-3xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                            Your Score: {quizScore.correct}/{quizScore.total}
                          </h3>
                          <p className={`text-xl ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            {quizScore.percentage}% - {
                              quizScore.percentage >= 90 ? '🌟 Excellent!' :
                                quizScore.percentage >= 70 ? '👍 Great Job!' :
                                  quizScore.percentage >= 50 ? '📚 Keep Practicing!' :
                                    '💪 Review and Try Again!'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
