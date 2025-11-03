import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  FileText,
  BookMarked,
  Zap,
  Target,
  TrendingUp,
  Award,
  Clock,
  BarChart3
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Enhanced Quiz Question Component with Theme
const EnhancedQuizQuestion = ({ question, questionNumber, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [showHint, setShowHint] = useState(false)
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
        <h4 className={`font-semibold text-lg pr-4 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
          <span className={`px-2 py-1 rounded-full text-sm mr-2 ${currentTheme === 'dark'
              ? 'bg-blue-900/30 text-blue-300'
              : 'bg-blue-100 text-blue-800'
            }`}>
            Q{questionNumber}
          </span>
          {question.question}
        </h4>
        {!showExplanation && (
          <button
            onClick={() => setShowHint(!showHint)}
            className={`transition-colors ${currentTheme === 'dark'
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-800'
              }`}
            title="Show hint"
          >
            <Lightbulb size={20} />
          </button>
        )}
      </div>

      {showHint && !showExplanation && (
        <div className={`mb-4 p-3 border rounded-lg ${currentTheme === 'dark'
            ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
          <p className="text-sm">
            💡 <strong>Hint:</strong> Think about the key concepts we discussed in the explanation above.
          </p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {question.choices?.map((choice, idx) => (
          <label
            key={idx}
            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 ${selectedAnswer === choice
                ? currentTheme === 'dark'
                  ? 'bg-blue-900/30 border-blue-600 ring-2 ring-blue-500/30'
                  : 'bg-blue-100 border-blue-300 ring-2 ring-blue-200'
                : currentTheme === 'dark'
                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
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
            <span className={`flex-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>{choice}</span>
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
        <div className={`mt-4 p-4 rounded-lg border-l-4 transition-all duration-300 ${isCorrect
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
              {isCorrect ? '🎉 Excellent! That\'s correct!' : '🤔 Not quite right, but great attempt!'}
            </p>
          </div>
          <p className="mb-2">
            <strong>Correct Answer:</strong> {question.answer}
          </p>
          {question.explanation && (
            <div className={`mt-3 p-3 rounded border ${currentTheme === 'dark'
                ? 'bg-gray-800/50'
                : 'bg-white/50'
              }`}>
              <p><strong>💡 Explanation:</strong> {question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Enhanced Content Tab Component with Theme
const ContentTab = ({ icon: Icon, label, isActive, onClick, badge }) => {
  const { currentTheme } = useTheme()

  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${isActive
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
          : currentTheme === 'dark'
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 shadow-md hover:shadow-lg border border-gray-600'
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
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

// ✅ NEW: Code Frame Block Component
const CodeFrameBlock = ({ content, currentTheme }) => {
  const [copied, setCopied] = useState(false)

  const copyContent = () => {
    // Extract just the code/text content, removing markdown
    const cleanContent = content.replace(/```/g, '');
    navigator.clipboard.writeText(cleanContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const detectContentType = (content) => {
    if (content.includes('http://') || content.includes('https://')) return 'url'
    if (content.includes('.cpp') || content.includes('.py') || content.includes('.js')) return 'code'
    if (content.includes('```')) return 'code'
    if (content.includes('`') && content.match(/`[^`]+`/)) return 'inline-code'
    return 'text'
  }

  const contentType = detectContentType(content)
  const icon = contentType === 'code' ? '💻' : contentType === 'url' ? '🌐' : '📝'

  return (
    <div className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-600'
        : 'bg-white border-gray-200'
      }`}>
      {/* Header with icon and copy button */}
      <div className={`flex justify-between items-center px-4 py-3 border-b transition-colors duration-300 ${currentTheme === 'dark'
          ? 'bg-gray-700 border-gray-600'
          : 'bg-gray-50 border-gray-200'
        }`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            {contentType === 'code' ? 'Code Example' : contentType === 'url' ? 'URL' : 'Content'}
          </span>
        </div>
        <button
          onClick={copyContent}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${currentTheme === 'dark'
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
        >
          <Copy size={14} />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className={`font-mono text-sm leading-relaxed transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-800'
          }`}>
          {content.split('\n').map((line, lineIndex) => {
            const trimmedLine = line.trim()
            if (!trimmedLine) return <div key={lineIndex} className="h-4"></div>

            return (
              <div key={lineIndex} className="mb-2">
                {formatBoldText(trimmedLine.replace(/```[\w]*|```/g, ''), currentTheme)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ✅ NEW: Content List Block Component
const ContentListBlock = ({ content, currentTheme }) => {
  // Clean up and organize bullet points
  const cleanContent = content
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove ** from headings
    .split('\n')
    .filter(line => line.trim())

  const items = []
  let currentCategory = null

  cleanContent.forEach((line, index) => {
    const trimmedLine = line.trim()

    // Check if it's a category header (contains ** or is standalone)
    if ((trimmedLine.includes('**') && !trimmedLine.startsWith('-  ') && !trimmedLine.startsWith('* ')) ||
      (!trimmedLine.startsWith('-  ') && !trimmedLine.startsWith('* ') && index === 0)) {
      currentCategory = trimmedLine.replace(/\*\*/g, '')
      items.push({ type: 'category', content: currentCategory })
    }
    // Check if it's a bullet point
    else if (trimmedLine.startsWith('-  ') || trimmedLine.startsWith('* ')) {
      const bulletContent = trimmedLine.replace(/^[- *]\s+/, '')
      items.push({ type: 'bullet', content: bulletContent, category: currentCategory })
    }
    // Regular content
    else if (trimmedLine) {
      items.push({ type: 'text', content: trimmedLine })
    }
  })

  return (
    <div className={`rounded-xl border p-6 transition-colors duration-300 ${currentTheme === 'dark'
        ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600'
        : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
      }`}>
      <div className="space-y-4">
        {items.map((item, itemIndex) => {
          if (item.type === 'category') {
            return (
              <div key={itemIndex} className="mb-4">
                <h4 className={`text-lg font-bold flex items-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                  {item.content}
                </h4>
              </div>
            )
          } else if (item.type === 'bullet') {
            return (
              <div key={itemIndex} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 shrink-0"></div>
                <div className={`flex-1 leading-relaxed transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  {formatBoldText(item.content, currentTheme)}
                </div>
              </div>
            )
          } else {
            return (
              <div key={itemIndex} className={`leading-relaxed transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                {formatBoldText(item.content, currentTheme)}
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

// Universal Content Block Component with Theme
const ContentBlock = ({ content, language = 'text', title = 'Content', type = 'text' }) => {
  const [copied, setCopied] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(type === 'code')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { currentTheme } = useTheme()

  const copyContent = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // For code content
  if (type === 'code') {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 p-4' : ''}`}>
        <div className={`bg-gray-900 rounded-lg overflow-hidden ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
          <div className="flex justify-between items-center bg-gray-800 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Code2 className="text-blue-400" size={16} />
              <span className="text-gray-300 text-sm font-medium">{title}</span>
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                {language.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-gray-300 hover:text-white transition-colors p-1"
                title="Toggle theme"
              >
                {isDarkMode ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-300 hover:text-white transition-colors p-1"
                title="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={copyContent}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1 px-2 py-1 rounded"
              >
                <Copy size={14} />
                <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <div className={`${isFullscreen ? 'flex-1 overflow-auto' : ''}`}>
            <SyntaxHighlighter
              language={language}
              style={isDarkMode ? vscDarkPlus : vs}
              customStyle={{
                margin: 0,
                padding: '1rem',
                height: isFullscreen ? '100%' : 'auto'
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    )
  }

  // For regular content
  return (
    <div className={`relative rounded-lg border overflow-hidden transition-colors duration-300 ${currentTheme === 'dark'
        ? 'bg-gray-800 border-gray-600'
        : 'bg-white border-gray-200'
      }`}>
      <div className={`flex justify-between items-center px-4 py-3 border-b transition-colors duration-300 ${currentTheme === 'dark'
          ? 'bg-gray-700 border-gray-600'
          : 'bg-gray-50 border-gray-200'
        }`}>
        <div className="flex items-center space-x-2">
          <FileText className={`w-4 h-4 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} />
          <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>{title}</span>
        </div>
        <button
          onClick={copyContent}
          className={`transition-colors flex items-center space-x-1 px-2 py-1 rounded text-sm ${currentTheme === 'dark'
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          <Copy size={14} />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4">
        <div className="prose prose-lg max-w-none">
          {formatContentWithAdvancedHeadings(content, currentTheme)}
        </div>
      </div>
    </div>
  )
}

// ✅ FIXED: Enhanced content formatting with proper styling
const formatContentWithAdvancedHeadings = (text, currentTheme) => {
  if (!text) return null
  
  // Split content into sections and process each
  const sections = text.split('\n\n').filter(section => section.trim())
  
  return sections.map((section, index) => {
    const trimmedSection = section.trim()
    
    // ✅ FIXED: Emoji headings with proper heading extraction
    if (trimmedSection.match(/^[✨🎯📚💡⭐🔥💻🧠🔍📊🎨]\s*(.+):$/m)) {
      const lines = trimmedSection.split('\n')
      
      // ✅ FIX: Get first line as string, not entire array
      const headingLine = String(lines[0] || '')
      const content = lines.slice(1).join('\n').trim()
      
      // More robust parsing: split on whitespace and strip trailing colon
      const parts = headingLine.split(/\s+/)
      const emoji = parts.shift() || ''
      const title = parts.join(' ').replace(/:\s*$/, '').trim()
      
      // ✅ Add safety check for empty emoji or title
      if (!emoji || !title) {
        return (
          <div key={index} className="mb-6">
            <div className={`p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-gray-800/30' : 'bg-white/50'}`}>
              <p className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                {formatBoldText(trimmedSection, currentTheme)}
              </p>
            </div>
          </div>
        )
      }
      
      return (
        <div key={index} className="mb-10">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700"></div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mx-4 flex items-center">
              <span className="text-2xl mr-3">{emoji}</span>
              {title}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700"></div>
          </div>
          {content && (
            <div className="ml-4">
              {formatNestedContent(content, currentTheme)}
            </div>
          )}
        </div>
      )
    }
    // ✅ FIXED: Code blocks detection and special formatting
    else if (trimmedSection.includes('```')) {
      return (
        <div key={index} className="mb-8">
          <CodeFrameBlock content={trimmedSection} currentTheme={currentTheme} />
        </div>
      )
    }

    // ✅ FIXED: Step-by-step instructions (numbered items with descriptions)
    else if (trimmedSection.match(/^\d+\.\s+/)) {
      const steps = trimmedSection.split(/(?=\d+\.\s+)/).filter(item => item.trim())

      return (
        <div key={index} className="mb-8">
          <div className="space-y-6">
            {steps.map((step, stepIndex) => {
              const match = step.match(/^(\d+)\.\s+(.+)/s)
              if (!match) return null

              const [, number, content] = match
              const [title, ...details] = content.split('\n')

              return (
                <div key={stepIndex} className={`rounded-xl p-6 border-l-4 border-blue-500 transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-400'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500'
                  }`}>
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold flex items-center justify-center shrink-0 text-lg shadow-lg">
                      {number}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                        {formatBoldText(title.trim(), currentTheme)}
                      </h3>
                      {details.length > 0 && (
                        <div className={`leading-relaxed transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {details.map((detail, detailIndex) => {
                            const trimmedDetail = detail.trim()
                            if (!trimmedDetail) return null

                            // ✅ FIXED: Handle sub-bullets in steps (corrected regex)
                            if (trimmedDetail.startsWith('• ') || trimmedDetail.startsWith('- ')) {
                              return (
                                <div key={detailIndex} className="flex items-start mt-2">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 shrink-0"></span>
                                  <span>{formatBoldText(trimmedDetail.replace(/^[•-]\s+/, ''), currentTheme)}</span>
                                </div>
                              )
                            }

                            return (
                              <div key={detailIndex} className="mt-2">
                                {formatBoldText(trimmedDetail, currentTheme)}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // ✅ FIXED: Bullet points - Convert multiple bullets to clean list
    else if (trimmedSection.includes('• ') || (trimmedSection.match(/\*/g) && (trimmedSection.match(/\*/g).length > 2))) {
      return (
        <div key={index} className="mb-8">
          <ContentListBlock content={trimmedSection} currentTheme={currentTheme} />
        </div>
      )
    }

    // ✅ FIXED: Regular paragraphs with better formatting
    else {
      return (
        <div key={index} className="mb-6">
          <div className={`p-4 rounded-lg transition-colors duration-300 ${currentTheme === 'dark'
              ? 'bg-gray-800/30'
              : 'bg-white/50'
            }`}>
            <p className={`leading-relaxed text-lg transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {formatBoldText(trimmedSection, currentTheme)}
            </p>
          </div>
        </div>
      )
    }
  })
}

// ✅ FIXED: Helper function for nested content formatting
const formatNestedContent = (content, currentTheme) => {
  if (!content) return null

  const lines = content.split('\n').filter(line => line.trim())

  return lines.map((line, index) => {
    const trimmedLine = line.trim()

    // ✅ FIXED: Handle bullet points with * or • (corrected regex)
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ')) {
      return (
        <div key={index} className="flex items-start mb-4">
          <span className="w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 shrink-0"></span>
          <div className={`flex-1 leading-relaxed transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
            {formatBoldText(trimmedLine.replace(/^[*•]\s+/, ''), currentTheme)}
          </div>
        </div>
      )
    }

    // Regular content
    if (trimmedLine) {
      return (
        <div key={index} className={`mb-3 leading-relaxed transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
          {formatBoldText(trimmedLine, currentTheme)}
        </div>
      )
    }

    return null
  }).filter(Boolean)
}

// ✅ FIXED: Helper function for bold text formatting
const formatBoldText = (text, currentTheme) => {
  if (!text) return ''

  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/).map((part, index) => {
    // Handle **bold** text
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className={`font-bold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    // Handle *italic* text
    else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} className={`italic transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
          {part.slice(1, -1)}
        </em>
      )
    }
    // Handle `code` text
    else if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className={`px-2 py-1 rounded text-sm font-mono transition-colors duration-300 ${currentTheme === 'dark'
            ? 'bg-gray-700 text-blue-300 border border-gray-600'
            : 'bg-gray-100 text-blue-800 border border-gray-200'
          }`}>
          {part.slice(1, -1)}
        </code>
      )
    }

    return part
  })
}

// Main Enhanced Content Generator Component with Theme
export default function EnhancedContentGenerator() {
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

  // Fetch user profile on mount
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

      // Handle different possible response structures from backend
      let processedData = data

      if (data.content) {
        processedData = {
          ...data,
          content: {
            ...data.content,
            explanation: data.content.explanation ||
              data.content.detailed_explanation ||
              data.content.content_explanation ||
              data.content.explanation_content,

            example: data.content.example ||
              data.content.examples ||
              data.content.practical_examples,

            exercise: data.content.exercise ||
              data.content.exercises ||
              data.content.practice_exercises,

            learning_tip: data.content.learning_tip ||
              data.content.learning_tips ||
              data.content.tips,

            quiz_questions: data.content.quiz_questions ||
              data.content.questions ||
              []
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
          !q.question.includes('**4. EMBEDDED QUIZ QUESTIONS**') &&
          !q.question.startsWith('**Question') &&
          Array.isArray(q.choices) &&
          q.choices.length >= 2 &&
          q.answer &&
          q.answer.trim().length > 0
        )
      })
      .map(q => ({
        ...q,
        question: q.question
          .replace(/\*\*\d+\.\s*\*\*Question\*\*:\s*/g, '')
          .replace(/\*\*/g, '')
          .trim(),
        answer: q.answer
          .replace(/\*\*\s*[A-D]\s*/g, '')
          .trim(),
        choices: q.choices.filter(choice => choice && choice.trim().length > 0),
        explanation: (q.explanation || '')
          .replace(/\*\*/g, '')
          .trim()
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

  const predictedSkill = content?.content?.predicted_level || userProfile?.stats?.skillLevel || 'beginner'
  const predictionConfidence = content?.content?.prediction_confidence || 0

  const tabs = [
    {
      key: 'explanation',
      label: 'Explanation',
      icon: BookOpen,
      content: content?.content?.explanation,
      description: 'Comprehensive explanation of the topic'
    },
    {
      key: 'example',
      label: 'Examples',
      icon: Code2,
      content: content?.content?.example,
      description: 'Practical examples and demonstrations'
    },
    {
      key: 'exercise',
      label: 'Exercises',
      icon: Brain,
      content: content?.content?.exercise,
      description: 'Hands-on practice exercises'
    },
    {
      key: 'quiz',
      label: 'Assessment',
      icon: Target,
      content: content?.content?.quiz_questions,
      description: 'Test your understanding'
    },
    {
      key: 'tips',
      label: 'Learning Tips',
      icon: Lightbulb,
      content: content?.content?.learning_tip,
      description: 'Personalized study recommendations'
    }
  ]

  const copyAllContent = () => {
    const textContent = `
🎓 TOPIC: ${content.content?.topic} (${content.content?.predicted_level?.toUpperCase()} Level)

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
    const textContent = `
# ${content.content?.topic} - AI Generated Learning Content

**Level:** ${content.content?.predicted_level?.toUpperCase()}
**Confidence:** ${Math.round(predictionConfidence * 100)}%
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
    a.download = `${content.content?.topic?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_content.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const detectContentLanguage = (content) => {
    if (!content) return 'text'

    // Programming language detection
    if (content.includes('def ') || content.includes('import ') || content.includes('print(')) return 'python'
    if (content.includes('function ') || content.includes('const ') || content.includes('let ')) return 'javascript'
    if (content.includes('public class ') || content.includes('System.out.println')) return 'java'
    if (content.includes('#include') || content.includes('int main(')) return 'cpp'
    if (content.includes('SELECT ') || content.includes('FROM ')) return 'sql'
    if (content.includes('<html') || content.includes('<div')) return 'html'
    if (content.includes('{') && content.includes('color:')) return 'css'

    return 'text'
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Enhanced Header with Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Content Generator
          </h1>
          <p className={`text-xl max-w-3xl mx-auto mb-6 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
            Generate personalized learning content with comprehensive quizzes powered by advanced AI and NLP
          </p>
          <div className="flex justify-center items-center flex-wrap gap-4">
            <div className={`flex items-center px-4 py-2 border rounded-full shadow-sm transition-colors duration-300 ${currentTheme === 'dark'
                ? 'bg-gray-800 border-blue-700'
                : 'bg-white border-blue-200'
              }`}>
              <Target className="w-4 h-4 text-blue-600 mr-2" />
              <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Predicted Level: <span className="text-blue-600">{predictedSkill.toUpperCase()}</span>
              </span>
              {predictionConfidence > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                  {Math.round(predictionConfidence * 100)}% confidence
                </span>
              )}
            </div>
            <div className={`flex items-center px-4 py-2 border rounded-full shadow-sm transition-colors duration-300 ${currentTheme === 'dark'
                ? 'bg-gray-800 border-green-700'
                : 'bg-white border-green-200'
              }`}>
              <Zap className="w-4 h-4 text-green-600 mr-2" />
              <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Powered by Gemini Flash</span>
            </div>
            <div className={`flex items-center px-4 py-2 border rounded-full shadow-sm transition-colors duration-300 ${currentTheme === 'dark'
                ? 'bg-gray-800 border-purple-700'
                : 'bg-white border-purple-200'
              }`}>
              <BookMarked className="w-4 h-4 text-purple-600 mr-2" />
              <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>spaCy Enhanced</span>
            </div>
          </div>
        </div>

        {/* Enhanced Input Form with Theme */}
        <div className={`rounded-3xl border p-8 shadow-xl mb-8 backdrop-blur-sm transition-colors duration-300 ${currentTheme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
          }`}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <label className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                What would you like to learn today?
              </label>
              <input
                name="topic"
                value={form.topic}
                onChange={onChange}
                placeholder="Search for any topic, e.g., Quantum Computing, French Grammar, Python Programming..."
                className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg transition-all ${currentTheme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder:text-gray-400'
                    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
                  }`}
              />
            </div>

            <div>
              <label className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
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
                <option value="summary">📋 Quick Summary</option>
              </select>
            </div>

            <div>
              <label className={`text-lg font-semibold mb-4 flex items-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
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
                <option value="intermediate">🟡 Intermediate Level</option>
                <option value="expert">🔴 Advanced/Expert</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>18 Questions</div>
                <div className={`text-xs transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>Comprehensive Assessment</div>
              </div>
            </div>
          </div>

          {error && (
            <div className={`mt-8 p-6 border-2 rounded-xl flex items-start transition-colors duration-300 ${currentTheme === 'dark'
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

        {/* Enhanced Generated Content with Theme */}
        {content && (
          <div className="space-y-8">
            {/* ✅ FIXED: Enhanced Header with Simplified Stats */}
            <div className={`rounded-3xl border shadow-xl backdrop-blur-sm overflow-hidden transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500"></div>

              <div className="p-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-8">
                  <div className="mb-6 xl:mb-0">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-3xl font-bold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                          {content.content?.topic}
                        </h2>
                        <p className={`mt-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>AI-Generated Learning Content</p>
                      </div>
                    </div>

                    {/* ✅ SIMPLIFIED: Only AI Generated + Word Count */}
                    <div className="flex flex-wrap gap-3">
                      <div className={`flex items-center px-4 py-2 border rounded-full transition-colors duration-300 ${currentTheme === 'dark'
                          ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700'
                          : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200'
                        }`}>
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-green-300' : 'text-green-800'
                          }`}>AI Generated</span>
                      </div>

                      {content.content?.word_count && (
                        <div className={`flex items-center px-4 py-2 border rounded-full transition-colors duration-300 ${currentTheme === 'dark'
                            ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700'
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200'
                          }`}>
                          <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
                          <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                            }`}>
                            {content.content.word_count} words
                          </span>
                        </div>
                      )}

                      {/* Assessment Questions Count */}
                      {content.content?.quiz_questions?.length > 0 && (
                        <div className={`flex items-center px-4 py-2 border rounded-full transition-colors duration-300 ${currentTheme === 'dark'
                            ? 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-700'
                            : 'bg-gradient-to-r from-red-100 to-pink-100 border-red-200'
                          }`}>
                          <Award className="w-4 h-4 text-red-600 mr-2" />
                          <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-red-300' : 'text-red-800'
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
                      <Copy className="mr-2" size={18} />
                      Copy All
                    </button>
                    <button
                      onClick={downloadContent}
                      className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${currentTheme === 'dark'
                          ? 'bg-green-900/30 text-green-300 hover:bg-green-800/40'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                      <Download className="mr-2" size={18} />
                      Download
                    </button>
                    <button
                      onClick={() => generateContent()}
                      className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${currentTheme === 'dark'
                          ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/40'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      <RefreshCw className="mr-2" size={18} />
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Enhanced Tab Navigation with Theme */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {tabs.map(({ key, label, icon, content: tabContent, description }) => (
                    <ContentTab
                      key={key}
                      icon={icon}
                      label={label}
                      isActive={activeTab === key}
                      onClick={() => setActiveTab(key)}
                      badge={key === 'quiz' && content?.content?.quiz_questions?.length}
                    />
                  ))}
                </div>

                {/* Enhanced Content Display with Theme */}
                <div className={`rounded-2xl p-8 min-h-[500px] border transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600'
                    : 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-100'
                  }`}>
                  {activeTab === 'explanation' && (
                    <div>
                      <div className="flex items-center mb-6">
                        <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className={`text-2xl font-bold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>Comprehensive Explanation</h3>
                      </div>

                      {content?.content?.explanation ? (
                        <ContentBlock
                          content={content.content.explanation}
                          title="Detailed Explanation"
                          type="text"
                        />
                      ) : (
                        <div className={`p-8 text-center rounded-lg border-2 border-dashed ${currentTheme === 'dark'
                            ? 'border-gray-600 text-gray-400'
                            : 'border-gray-300 text-gray-500'
                          }`}>
                          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h4 className="text-lg font-semibold mb-2">No Explanation Available</h4>
                          <p>Please try regenerating the content.</p>
                          <button
                            onClick={() => generateContent()}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Regenerate Content
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'example' && (
                    <div>
                      <div className="flex items-center mb-6">
                        <Code2 className="w-6 h-6 text-purple-600 mr-3" />
                        <h3 className={`text-2xl font-bold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>Practical Examples</h3>
                      </div>

                      {content?.content?.example ? (
                        <ContentBlock
                          content={content.content.example}
                          language={detectContentLanguage(content.content.example)}
                          title={`${content.content?.topic} - Examples`}
                          type={detectContentLanguage(content.content.example) !== 'text' ? 'code' : 'text'}
                        />
                      ) : (
                        <div className={`p-8 text-center rounded-lg border-2 border-dashed ${currentTheme === 'dark'
                            ? 'border-gray-600 text-gray-400'
                            : 'border-gray-300 text-gray-500'
                          }`}>
                          <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h4 className="text-lg font-semibold mb-2">No Examples Available</h4>
                          <p>Examples were not generated for this topic.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'exercise' && (
                    <div>
                      <div className="flex items-center mb-6">
                        <Brain className="w-6 h-6 text-green-600 mr-3" />
                        <h3 className={`text-2xl font-bold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>Practice Exercises</h3>
                      </div>

                      {content?.content?.exercise ? (
                        <ContentBlock
                          content={content.content.exercise}
                          title="Hands-on Exercises"
                          type="text"
                        />
                      ) : (
                        <div className={`p-8 text-center rounded-lg border-2 border-dashed ${currentTheme === 'dark'
                            ? 'border-gray-600 text-gray-400'
                            : 'border-gray-300 text-gray-500'
                          }`}>
                          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h4 className="text-lg font-semibold mb-2">No Exercises Available</h4>
                          <p>Practice exercises were not generated for this topic.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'quiz' && content.content?.quiz_questions && content.content.quiz_questions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <Target className="w-6 h-6 text-red-600 mr-3" />
                          <h3 className={`text-2xl font-bold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                            }`}>Comprehensive Assessment</h3>
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {content.content.quiz_questions.length} Questions • Skill Level Prediction
                        </div>
                      </div>

                      {quizScore && (
                        <div className={`mb-8 p-6 rounded-2xl font-medium text-center shadow-lg transition-colors duration-300 ${quizScore.percentage >= 80
                            ? currentTheme === 'dark'
                              ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-300 border-2 border-green-700'
                              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200'
                            : quizScore.percentage >= 60
                              ? currentTheme === 'dark'
                                ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 text-yellow-300 border-2 border-yellow-700'
                                : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-2 border-yellow-200'
                              : currentTheme === 'dark'
                                ? 'bg-gradient-to-r from-red-900/30 to-pink-900/30 text-red-300 border-2 border-red-700'
                                : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-200'
                          }`}>
                          <div className="text-4xl mb-3">
                            {quizScore.percentage >= 80 ? '🏆' : quizScore.percentage >= 60 ? '👍' : '💪'}
                          </div>
                          <p className="text-2xl mb-2">
                            Score: {quizScore.correct}/{quizScore.total} ({quizScore.percentage}%)
                          </p>
                          <p className="text-lg">
                            {quizScore.percentage >= 80
                              ? 'Outstanding! You have excellent mastery of this topic!'
                              : quizScore.percentage >= 60
                                ? 'Great job! You have good understanding. Keep practicing!'
                                : 'Good effort! Review the content and strengthen your knowledge.'}
                          </p>
                        </div>
                      )}

                      <div className="space-y-6">
                        {content.content.quiz_questions.map((question, index) => (
                          <EnhancedQuizQuestion
                            key={index}
                            question={question}
                            questionNumber={index + 1}
                            onAnswer={(selectedAnswer, isCorrect) => handleQuizAnswer(index, selectedAnswer, isCorrect)}
                          />
                        ))}
                      </div>

                      {quizScore && (
                        <div className="mt-10 text-center">
                          <Link
                            to={`/quiz/interface?topic=${encodeURIComponent(content.content?.topic)}`}
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                          >
                            <PlayCircle className="mr-2" size={20} />
                            Take Full Skill Assessment
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'tips' && (
                    <div>
                      <div className="flex items-center mb-6">
                        <Lightbulb className="w-6 h-6 text-yellow-600 mr-3" />
                        <h3 className={`text-2xl font-bold transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>Personalized Learning Tips</h3>
                      </div>

                      {content?.content?.learning_tip ? (
                        <ContentBlock
                          content={content.content.learning_tip}
                          title="Study Recommendations"
                          type="text"
                        />
                      ) : (
                        <div className={`p-8 text-center rounded-lg border-2 border-dashed ${currentTheme === 'dark'
                            ? 'border-gray-600 text-gray-400'
                            : 'border-gray-300 text-gray-500'
                          }`}>
                          <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h4 className="text-lg font-semibold mb-2">No Learning Tips Available</h4>
                          <p>Learning recommendations were not generated for this topic.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps Section with Theme */}
            <div className={`rounded-3xl border p-8 shadow-xl backdrop-blur-sm transition-colors duration-300 ${currentTheme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-3xl font-bold mb-8 text-center flex items-center justify-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                Continue Your Learning Journey
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link
                  to="/quiz/interface"
                  className={`group flex flex-col items-center p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${currentTheme === 'dark'
                      ? 'border-gray-600 hover:border-blue-500 hover:bg-blue-900/20'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={`font-bold text-xl mb-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Practice More</h4>
                  <p className={`text-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Take additional comprehensive quizzes on this topic</p>
                </Link>

                <Link
                  to="/courses"
                  className={`group flex flex-col items-center p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${currentTheme === 'dark'
                      ? 'border-gray-600 hover:border-green-500 hover:bg-green-900/20'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookMarked className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={`font-bold text-xl mb-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Explore Courses</h4>
                  <p className={`text-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Find structured learning paths and comprehensive courses</p>
                </Link>

                <Link
                  to="/analytics"
                  className={`group flex flex-col items-center p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${currentTheme === 'dark'
                      ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-900/20'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={`font-bold text-xl mb-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>View Progress</h4>
                  <p className={`text-center transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Track your learning analytics and skill development</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
