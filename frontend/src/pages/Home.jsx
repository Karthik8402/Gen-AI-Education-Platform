import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext' // ✅ Add this import
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
  LightBulbIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Award,
  Clock,
  Users,
  Globe,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  BookMarked,
  BarChart3,
  Lightbulb,
  Sparkles,
  Eye,
  Timer,
  Trophy
} from 'lucide-react'

const Home = () => {
  const { currentTheme } = useTheme() // ✅ Add theme hook
  const [stats, setStats] = useState({ students: 0, courses: 0, quizzes: 0 })
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // Animate statistics counter
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ students: 1250, courses: 45, quizzes: 12500 })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Content Generation",
      description: "Generate personalized study materials, explanations, and practice questions tailored to your learning style and skill level.",
      color: "from-blue-500 to-indigo-600",
      delay: "0ms"
    },
    {
      icon: Target,
      title: "Adaptive Quiz System",
      description: "Smart quizzes that adjust difficulty in real-time based on your performance, ensuring optimal learning progression.",
      color: "from-purple-500 to-violet-600",
      delay: "200ms"
    },
    {
      icon: BarChart3,
      title: "Intelligent Analytics",
      description: "Track your progress with detailed insights and AI-driven recommendations for continuous improvement.",
      color: "from-emerald-500 to-green-600",
      delay: "400ms"
    },
    {
      icon: Zap,
      title: "Real-time Skill Assessment",
      description: "Machine learning algorithms continuously evaluate your skill level and adapt content accordingly.",
      color: "from-orange-500 to-red-600",
      delay: "600ms"
    }
  ]

  const testimonials = [
    {
      quote: "This AI-powered platform transformed how I learn. The personalized quizzes helped me improve my programming skills by 40% in just 2 months!",
      author: "Sarah Chen",
      role: "Computer Science Student",
      avatar: "👩‍💻"
    },
    {
      quote: "The adaptive content generation is incredible. It's like having a personal tutor that knows exactly what I need to work on.",
      author: "Michael Rodriguez",
      role: "Data Science Graduate",
      avatar: "👨‍🎓"
    },
    {
      quote: "The analytics dashboard gives me clear insights into my progress. I can see exactly where I'm improving and what needs more focus.",
      author: "Emma Watson",
      role: "Machine Learning Engineer",
      avatar: "👩‍🔬"
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Set up your learning preferences and take our AI assessment to determine your skill level.",
      icon: Users
    },
    {
      number: "02", 
      title: "Get Personalized Content",
      description: "Receive AI-generated study materials and quizzes tailored specifically to your learning needs.",
      icon: Sparkles
    },
    {
      number: "03",
      title: "Track Your Progress",
      description: "Monitor your improvement with detailed analytics and receive intelligent recommendations.",
      icon: TrendingUp
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      currentTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700' 
        : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
    }`}>
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
              : 'bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800'
          }`}></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJtIDYwIDAgLTYwIDAgMCAtNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIxMjEyMSIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            {/* Animated Badge */}
            <div className={`inline-flex items-center rounded-full backdrop-blur-sm border px-6 py-2 text-sm mb-8 transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'bg-gray-800/50 border-gray-600/50 text-gray-200'
                : 'bg-white/10 border-white/20 text-white'
            }`}>
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span>Powered by Advanced AI & Machine Learning</span>
            </div>

            {/* Main Heading */}
            <h1 className={`mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl mb-8 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-white'
            }`}>
              Transform Learning with
              <span className="relative">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> AI Education</span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transform scale-x-0 animate-scale-x"></div>
              </span>
            </h1>
            
            <p className={`mx-auto max-w-2xl text-xl leading-8 mb-12 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-indigo-100'
            }`}>
              Experience the future of personalized learning with AI-powered content generation, 
              adaptive assessments, and intelligent progress tracking designed for your success.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to="/dashboard"
                className={`group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden ${
                  currentTheme === 'dark'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-white text-indigo-600 hover:bg-gray-100'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Get Started Free</span>
                <ArrowRight className="relative z-10 ml-2 w-5 h-5 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </Link>
              
              <button className={`group flex items-center px-8 py-4 border-2 rounded-2xl font-semibold text-lg backdrop-blur-sm transition-all duration-300 ${
                currentTheme === 'dark'
                  ? 'text-gray-200 border-gray-600 hover:bg-gray-700/50 hover:border-gray-500'
                  : 'text-white border-white/20 hover:bg-white/10 hover:border-white/40'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-white/20'
                }`}>
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className={`flex flex-wrap items-center justify-center gap-8 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-white/80'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-white'
                }`}>{stats.students.toLocaleString()}+</div>
                <div className="text-sm">Active Learners</div>
              </div>
              <div className={`w-px h-8 hidden sm:block transition-colors duration-300 ${
                currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white/20'
              }`}></div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-white'
                }`}>{stats.courses}+</div>
                <div className="text-sm">AI-Generated Courses</div>
              </div>
              <div className={`w-px h-8 hidden sm:block transition-colors duration-300 ${
                currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white/20'
              }`}></div>
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-white'
                }`}>{stats.quizzes.toLocaleString()}+</div>
                <div className="text-sm">Smart Assessments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className={`inline-flex items-center rounded-full px-6 py-2 text-sm font-medium mb-6 transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'bg-indigo-900/30 text-indigo-300'
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              <Brain className="w-4 h-4 mr-2" />
              Intelligent Learning Platform
            </div>
            <h2 className={`text-4xl font-bold tracking-tight sm:text-5xl mb-6 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              AI-Powered Educational Features
            </h2>
            <p className={`mx-auto max-w-2xl text-xl transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Discover how artificial intelligence revolutionizes your learning experience 
              with personalized content and adaptive assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group relative p-8 rounded-3xl border shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
                style={{ animationDelay: feature.delay }}
              >
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-br from-gray-700 to-gray-600'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50'
                }`}></div>
                
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                    currentTheme === 'dark'
                      ? 'text-gray-100 group-hover:text-indigo-300'
                      : 'text-gray-900 group-hover:text-indigo-900'
                  }`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`leading-relaxed transition-colors duration-300 ${
                    currentTheme === 'dark'
                      ? 'text-gray-300 group-hover:text-gray-200'
                      : 'text-gray-600 group-hover:text-gray-700'
                  }`}>
                    {feature.description}
                  </p>
                  
                  <div className={`mt-6 flex items-center font-medium transition-colors duration-300 ${
                    currentTheme === 'dark'
                      ? 'text-indigo-400 group-hover:text-indigo-300'
                      : 'text-indigo-600 group-hover:text-indigo-700'
                  }`}>
                    <span>Learn More</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-24 transition-colors duration-300 ${
        currentTheme === 'dark'
          ? 'bg-gradient-to-r from-gray-800 to-gray-700'
          : 'bg-gradient-to-r from-gray-50 to-blue-50'
      }`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className={`text-4xl font-bold mb-6 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>How It Works</h2>
            <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Get started with AI-powered learning in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
              <div className="flex justify-between">
                <div className={`w-1/3 h-0.5 mt-8 transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-transparent to-indigo-500'
                    : 'bg-gradient-to-r from-transparent to-indigo-300'
                }`}></div>
                <div className={`w-1/3 h-0.5 mt-8 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-300'
                }`}></div>
                <div className={`w-1/3 h-0.5 mt-8 transition-colors duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-500 to-transparent'
                    : 'bg-gradient-to-r from-indigo-300 to-transparent'
                }`}></div>
              </div>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg mb-6 shadow-lg">
                  {step.number}
                </div>
                <div className={`rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex justify-center mb-4">
                    <step.icon className={`w-12 h-12 transition-colors duration-300 ${
                      currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>{step.title}</h3>
                  <p className={`leading-relaxed transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-24 sm:py-32 transition-colors duration-300 ${
        currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className={`text-4xl font-bold mb-6 transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>What Students Say</h2>
            <p className={`text-xl transition-colors duration-300 ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Hear from learners who transformed their education with AI
            </p>
          </div>

          <div className="relative">
            <div className={`overflow-hidden rounded-3xl p-8 shadow-xl transition-colors duration-300 ${
              currentTheme === 'dark'
                ? 'bg-gradient-to-r from-gray-800 to-gray-700'
                : 'bg-gradient-to-r from-indigo-50 to-purple-50'
            }`}>
              <div className="text-center max-w-4xl mx-auto">
                <div className="text-6xl mb-6">{testimonials[currentTestimonial].avatar}</div>
                <blockquote className={`text-2xl font-medium mb-8 leading-relaxed transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <div className={`font-semibold text-lg transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  {testimonials[currentTestimonial].author}
                </div>
                <div className={`mt-1 transition-colors duration-300 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? currentTheme === 'dark' 
                        ? 'bg-indigo-400 scale-125' 
                        : 'bg-indigo-600 scale-125'
                      : currentTheme === 'dark'
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute inset-0 transition-colors duration-300 ${
            currentTheme === 'dark'
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
              : 'bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900'
          }`}></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJtIDYwIDAgLTYwIDAgMCAtNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIxMjEyMSIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 sm:py-32">
          <div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="max-w-xl lg:max-w-lg">
              <h2 className={`text-4xl font-bold tracking-tight sm:text-5xl mb-6 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-100' : 'text-white'
              }`}>
                Ready to Transform Your Learning Journey?
              </h2>
              <p className={`text-xl leading-8 mb-10 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-300'
              }`}>
                Join thousands of students already using our AI-powered platform 
                to achieve their educational goals faster and more effectively than ever before.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl shadow-xl hover:from-indigo-400 hover:to-purple-400 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Start Learning Today
                </Link>
                <Link
                  to="/quiz"
                  className={`inline-flex items-center justify-center px-8 py-4 border-2 font-semibold rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                    currentTheme === 'dark'
                      ? 'border-gray-600 text-gray-200 hover:bg-gray-700/50 hover:border-gray-500'
                      : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                  }`}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Try a Sample Quiz
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className={`mt-10 flex items-center space-x-6 transition-colors duration-300 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                <div className="relative z-10">
                  <div className="w-80 h-80 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl">
                    <Brain className="w-32 h-32 text-white animate-pulse" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-30 scale-110 animate-pulse"></div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce animation-delay-1000">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-1/2 -left-8 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce animation-delay-2000">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
