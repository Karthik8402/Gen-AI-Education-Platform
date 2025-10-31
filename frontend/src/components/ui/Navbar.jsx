// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import {
  Menu,
  X,
  Brain,
  Home,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  Sparkles,
  ChevronDown,
  Bell,
  BarChart3,
  PenTool,
  GraduationCap
} from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

const Navbar = () => {
  const { currentTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Content', href: '/content', icon: PenTool },
    { name: 'Quiz', href: '/quiz/interface', icon: Brain },
    { name: 'Courses', href: '/courses', icon: GraduationCap }
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
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
      {/* ✅ FIX: Use currentTheme with explicit conditional */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? currentTheme === 'dark'
            ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-lg'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg'
          : currentTheme === 'dark'
            ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 shadow-sm'
            : 'bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm'
      }`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mindgen
              </span>
              <div className={`text-xs font-medium ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>AI Education</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(item.href)
                      ? currentTheme === 'dark'
                        ? 'text-indigo-400 bg-indigo-900/20 shadow-lg scale-105'
                        : 'text-indigo-600 bg-indigo-50 shadow-lg scale-105'
                      : currentTheme === 'dark'
                        ? 'text-gray-300 hover:text-indigo-400 hover:bg-gray-800'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  
                  {isActive(item.href) && (
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      currentTheme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'
                    }`}></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <ThemeToggle variant="simple" />
                
                <button className={`p-2 rounded-lg transition-all ${
                  currentTheme === 'dark'
                    ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                }`}>
                  <Bell className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-all group ${
                      currentTheme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-semibold ${
                        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {user.name || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className={`text-xs capitalize ${
                        currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {user.role || 'Student'}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 ${
                      currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    } ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl py-2 z-50 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className={`px-4 py-3 border-b ${
                        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className={`font-semibold ${
                              currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {user.name || user.email?.split('@')[0] || 'User'}
                            </div>
                            <div className={`text-sm ${
                              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>{user.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to="/profile"
                        className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                          currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className={`w-4 h-4 ${
                          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>Profile Settings</span>
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                          currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className={`w-4 h-4 ${
                          currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>Dashboard</span>
                      </Link>

                      <Link
                        to="/analytics"
                        className={`flex items-center space-x-3 px-4 py-3 transition-colors group ${
                          currentTheme === 'dark' ? 'hover:bg-indigo-900/20' : 'hover:bg-indigo-50'
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className={`p-1 rounded-lg ${
                          currentTheme === 'dark'
                            ? 'bg-indigo-900/30 group-hover:bg-indigo-800/40'
                            : 'bg-indigo-100 group-hover:bg-indigo-200'
                        }`}>
                          <BarChart3 className={`w-3 h-3 ${
                            currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                          }`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>Analytics</span>
                        <span className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full font-bold">
                          NEW
                        </span>
                      </Link>

                      <div className={`border-t mt-1 pt-1 ${
                        currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                      }`}>
                        <button
                          onClick={handleLogout}
                          className={`flex items-center space-x-3 w-full px-4 py-3 transition-colors text-left ${
                            currentTheme === 'dark'
                              ? 'hover:bg-red-900/20 text-red-400'
                              : 'hover:bg-red-50 text-red-700'
                          }`}
                        >
                          <LogOut className={`w-4 h-4 ${
                            currentTheme === 'dark' ? 'text-red-400' : 'text-red-500'
                          }`} />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <ThemeToggle variant="simple" />
                
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    currentTheme === 'dark'
                      ? 'text-gray-300 hover:text-indigo-400'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
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

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            <ThemeToggle variant="simple" />
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-3 rounded-xl transition-all ${
                currentTheme === 'dark'
                  ? 'text-gray-300 hover:text-indigo-400 hover:bg-gray-700'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
              }`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden backdrop-blur-md border-t shadow-xl ${
            currentTheme === 'dark'
              ? 'bg-gray-900/95 border-gray-700'
              : 'bg-white/95 border-gray-200'
          }`}>
            <nav className="px-6 py-6 space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive(item.href) 
                        ? currentTheme === 'dark'
                          ? 'text-indigo-400 bg-indigo-900/20 shadow-lg'
                          : 'text-indigo-600 bg-indigo-50 shadow-lg'
                        : currentTheme === 'dark'
                          ? 'text-gray-300 hover:text-indigo-400 hover:bg-gray-800'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        />
      )}

      <div className="h-20"></div>
    </>
  )
}

export default Navbar
