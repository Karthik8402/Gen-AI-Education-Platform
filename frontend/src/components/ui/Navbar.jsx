import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Menu,
  X,
  Brain,
  Home,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  User,
  LogOut,
  LogIn,
  Sparkles,
  ChevronDown,
  Bell,
  Search,
  Settings,
  BarChart3,
  PenTool,
  Activity
} from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle' // ✅ Fixed import path

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ Updated navigation with correct quiz route
  const navigation = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      description: 'Return to homepage'
    },
    { 
      name: 'Content', 
      href: '/content', 
      icon: PenTool,
      description: 'AI-powered content generation'
    },
    { 
      name: 'Quiz', 
      href: '/quiz/interface', // ✅ Changed from /quiz to /quiz/interface
      icon: Brain,
      description: 'Take AI-powered quizzes'
    },
    { 
      name: 'Courses', 
      href: '/courses', 
      icon: GraduationCap,
      description: 'Browse learning courses'
    }
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    // ✅ Special handling for quiz interface
    if (path === '/quiz/interface' && location.pathname.startsWith('/quiz')) return true
    return false
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg' 
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm'
      }`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Enhanced Logo */}
          <Link 
            to="/" 
            className="group flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EduAI
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI Education</div>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`} />
                  <span>{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Enhanced Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* ✅ Theme Toggle Added */}
                <ThemeToggle variant="simple" />
                
                {/* Notification Bell */}
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                  <Bell className="w-5 h-5" />
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {user.name || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role || 'Student'}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* ✅ Updated Dropdown Menu: Profile → Dashboard → Analytics */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {user.name || user.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* ✅ Profile First */}
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Settings</span>
                      </Link>
                      
                      {/* ✅ Dashboard Second */}
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
                      </Link>

                      {/* ✅ Analytics Third */}
                      <Link
                        to="/analytics"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40 transition-colors">
                          <BarChart3 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</span>
                        <span className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full font-bold">
                          NEW
                        </span>
                      </Link>

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                          <span className="text-sm font-medium text-red-700 dark:text-red-400">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* ✅ Theme Toggle for non-authenticated users */}
                <ThemeToggle variant="simple" />
                
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* ✅ Theme Toggle for Mobile - Next to Menu Button */}
            <ThemeToggle variant="simple" />
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-xl">
            <nav className="px-6 py-6 space-y-3">
              {/* ✅ Main Navigation: Home → Content → Quiz (interface) → Courses */}
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive(item.href) 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </Link>
                )
              })}

              {/* ✅ Profile Section in Mobile: Profile → Dashboard → Analytics */}
              {user && (
                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profile & Settings
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-semibold">Profile</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-semibold">Dashboard</span>
                  </Link>

                  <Link
                    to="/analytics"
                    className="flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      <span className="font-semibold">Analytics</span>
                    </div>
                    <span className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full font-bold">
                      NEW
                    </span>
                  </Link>
                </div>
              )}

              {/* Mobile Auth Section */}
              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {user.name || user.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {user.role || 'Student'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Get Started</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>
    </>
  )
}

export default Navbar
