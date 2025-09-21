// src/features/Analytics/AnalyticsMe.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp, BookOpen, Trophy, Target, Brain, Calendar,
    Award, BarChart3, PieChart as PieChartIcon, Activity,
    Users, Clock, CheckCircle, AlertCircle, Star, RotateCcw,
    TrendingDown, Zap, Eye, ArrowRight, Sparkles
} from 'lucide-react';

// ✅ Beautiful Analytics Loader Component
const AnalyticsLoader = () => {
    const { currentTheme } = useTheme()

    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
            currentTheme === 'dark'
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
                : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}>
            <div className="text-center max-w-md mx-auto px-6">
                {/* Main Icon Container */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="relative">
                        {/* Spinning Border */}
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        
                        {/* Center Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-indigo-600" />
                        </div>
                        
                        {/* Floating Sparkles */}
                        <div className="absolute -top-2 -right-2 animate-bounce">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="absolute -bottom-1 -left-1 animate-pulse">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="space-y-4 mb-8">
                    <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                        Loading Your Analytics
                    </h2>
                    
                    <p className={`text-lg leading-relaxed transition-colors duration-300 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Analyzing your learning data and generating personalized insights...
                    </p>
                </div>

                {/* Animated Stats Preview */}
                <div className={`rounded-2xl border p-6 mb-8 backdrop-blur-sm transition-colors duration-300 ${
                    currentTheme === 'dark'
                        ? 'bg-gray-800/80 border-gray-600'
                        : 'bg-white/80 border-gray-200'
                }`}>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 animate-pulse"></div>
                            <div className={`text-sm transition-colors duration-300 ${
                                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>Performance</div>
                        </div>
                        <div className="text-center">
                            <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className={`text-sm transition-colors duration-300 ${
                                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>Progress</div>
                        </div>
                        <div className="text-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            <div className={`text-sm transition-colors duration-300 ${
                                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>Insights</div>
                        </div>
                    </div>
                </div>

                {/* AI Powered Badge */}
                <div className={`flex items-center justify-center space-x-2 text-sm transition-colors duration-300 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    <Brain className="w-4 h-4" />
                    <span>Powered by Advanced AI Analytics</span>
                </div>

                {/* Animated Progress Dots */}
                <div className="flex justify-center space-x-2 mt-8">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full animate-bounce transition-colors duration-300 ${
                                currentTheme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'
                            }`}
                            style={{ 
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '1s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const Analytics = () => {
    const { user } = useAuth();
    const { currentTheme } = useTheme();
    const navigate = useNavigate();

    // State management
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async (showRefreshLoader = false) => {
        try {
            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // ✅ Correct API call using your existing api service
            const response = await api('/api/analytics/me');

            // ✅ Handle the response properly
            if (response.status === 'success') {
                setAnalytics(response.analytics);
            } else {
                throw new Error(response.error || 'Failed to load analytics');
            }

        } catch (err) {
            console.error('Analytics fetch error:', err);

            // ✅ Handle different error types
            if (err.response) {
                // Server responded with error
                setError(err.response.error || err.response.message || 'Server error occurred');
            } else if (err.request) {
                // Network error
                setError('Unable to connect to server. Please check your internet connection.');
            } else {
                // Other error
                setError(err.message || 'Failed to load analytics data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchAnalytics(true);
    };

    // Chart color themes
    const CHART_COLORS = {
        primary: currentTheme === 'dark' ? '#818cf8' : '#3B82F6',
        secondary: currentTheme === 'dark' ? '#34d399' : '#10B981',
        accent: currentTheme === 'dark' ? '#fbbf24' : '#F59E0B',
        danger: currentTheme === 'dark' ? '#f87171' : '#EF4444',
        purple: currentTheme === 'dark' ? '#a78bfa' : '#8B5CF6',
        pink: currentTheme === 'dark' ? '#f472b6' : '#EC4899',
        teal: currentTheme === 'dark' ? '#22d3ee' : '#06B6D4'
    };

    const DIFFICULTY_COLORS = [
        currentTheme === 'dark' ? '#34d399' : '#10B981', // Beginner - Green
        currentTheme === 'dark' ? '#fbbf24' : '#F59E0B', // Intermediate - Orange  
        currentTheme === 'dark' ? '#f87171' : '#EF4444'  // Advanced - Red
    ];

    // ✅ BEAUTIFUL LOADER - Using the same style as PlacementQuiz
    if (loading) {
        return <AnalyticsLoader />
    }

    if (error) {
        return (
            <div className={`min-h-screen p-4 lg:p-6 flex items-center justify-center transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
                    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
                }`}>
                <div className="text-center max-w-md">
                    <AlertCircle className={`w-16 h-16 mx-auto mb-6 ${currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`} />
                    <h3 className={`text-2xl font-bold mb-4 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>Unable to Load Analytics</h3>
                    <p className={`mb-8 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={fetchAnalytics}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${currentTheme === 'dark'
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                        >
                            <RotateCcw className="w-5 h-5" />
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/quiz/interface')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentTheme === 'dark'
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                        >
                            <BookOpen className="w-5 h-5" />
                            Take Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics || !analytics.performance || analytics.performance.totalAttempts === 0) {
        return (
            <div className={`min-h-screen p-4 lg:p-6 flex items-center justify-center transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
                    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
                }`}>
                <div className="text-center max-w-lg">
                    <Brain className={`w-20 h-20 mx-auto mb-6 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                    <h3 className={`text-2xl font-bold mb-4 ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>No Analytics Data Yet</h3>
                    <p className={`mb-8 text-lg ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>Start taking quizzes to see your personalized learning analytics and insights!</p>
                    <button
                        onClick={() => navigate('/quiz/interface')}
                        className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${currentTheme === 'dark'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        Take Your First Quiz
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 lg:p-6 transition-colors duration-300 ${currentTheme === 'dark'
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
                : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
            }`}>
            {/* Header Section */}
            <div className={`rounded-3xl border backdrop-blur-sm p-6 lg:p-8 mb-6 transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700/50'
                    : 'bg-white/95 border-white/20'
                }`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className={`text-3xl lg:text-4xl font-bold transition-colors duration-300 ${currentTheme === 'dark'
                                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'
                                }`}>
                                Learning Analytics Dashboard
                            </h1>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className={`p-2 rounded-lg transition-all duration-200 ${refreshing ? 'animate-spin' : ''
                                    } ${currentTheme === 'dark'
                                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                        <p className={`text-lg mb-4 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Welcome back, {analytics?.student?.username || 'Student'}! Track your progress and discover insights.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${currentTheme === 'dark'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                }`}>
                                <Brain className="w-4 h-4" />
                                <span>{analytics?.student?.currentSkillLevel || 'Beginner'}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${currentTheme === 'dark'
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                <Calendar className="w-4 h-4" />
                                <span>Member since {analytics?.student?.memberSince ? new Date(analytics.student.memberSince).toLocaleDateString() : 'Recently'}</span>
                            </div>
                            {analytics?.performance?.learningStreak > 0 && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${currentTheme === 'dark'
                                        ? 'bg-orange-900/30 text-orange-300'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    <span>🔥</span>
                                    <span>{analytics.performance.learningStreak} day streak</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={`text-center p-6 rounded-2xl ${currentTheme === 'dark'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}>
                        <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                        <div className="text-3xl font-bold text-white">
                            {Math.round(analytics?.performance?.overallAccuracy || 0)}%
                        </div>
                        <div className="text-green-100 text-sm">Overall Accuracy</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className={`rounded-2xl border backdrop-blur-sm p-2 mb-6 transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700/50'
                    : 'bg-white/95 border-white/20'
                }`}>
                <div className="grid grid-cols-2 lg:flex gap-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'performance', label: 'Performance', icon: Activity },
                        { id: 'insights', label: 'Insights', icon: Brain },
                        { id: 'achievements', label: 'Achievements', icon: Trophy }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                                    ? currentTheme === 'dark'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                    : currentTheme === 'dark'
                                        ? 'text-gray-300 hover:bg-gray-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className={`rounded-3xl border backdrop-blur-sm p-6 lg:p-8 transition-colors duration-300 ${currentTheme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700/50'
                    : 'bg-white/95 border-white/20'
                }`}>
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Key Performance Indicators */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: BookOpen,
                                    label: 'Quiz Attempts',
                                    value: analytics?.performance?.totalAttempts || 0,
                                    change: `${analytics?.performance?.learningStreak || 0} day streak`,
                                    color: 'bg-indigo-500',
                                    trend: analytics?.performance?.learningVelocity > 0 ? 'up' : 'stable'
                                },
                                {
                                    icon: Target,
                                    label: 'Overall Accuracy',
                                    value: `${Math.round(analytics?.performance?.overallAccuracy || 0)}%`,
                                    change: `${analytics?.performance?.learningVelocity > 0 ? '+' : ''}${Math.round(analytics?.performance?.learningVelocity || 0)}% velocity`,
                                    color: 'bg-green-500',
                                    trend: analytics?.performance?.learningVelocity > 0 ? 'up' : analytics?.performance?.learningVelocity < 0 ? 'down' : 'stable'
                                },
                                {
                                    icon: CheckCircle,
                                    label: 'Questions Solved',
                                    value: analytics?.performance?.totalQuestions || 0,
                                    change: `${analytics?.performance?.totalCorrect || 0} correct`,
                                    color: 'bg-orange-500',
                                    trend: 'stable'
                                },
                                {
                                    icon: Zap,
                                    label: 'Consistency Score',
                                    value: `${Math.round(analytics?.performance?.consistencyScore || 0)}%`,
                                    change: 'Learning quality',
                                    color: 'bg-purple-500',
                                    trend: 'stable'
                                }
                            ].map((kpi, index) => (
                                <div key={index} className={`rounded-2xl p-6 border-l-4 transition-all duration-300 hover:scale-105 ${currentTheme === 'dark'
                                        ? `bg-gray-700/50 border-l-4`
                                        : `bg-gradient-to-br from-gray-50 to-gray-100 border-l-4`
                                    } ${kpi.color.replace('bg-', 'border-')}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-3 rounded-xl ${kpi.color}`}>
                                            <kpi.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={`font-semibold ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                            }`}>{kpi.label}</span>
                                    </div>
                                    <div className={`text-3xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                        }`}>
                                        {kpi.value}
                                    </div>
                                    <div className={`text-sm font-medium flex items-center gap-1 ${kpi.trend === 'up' ? 'text-green-600' :
                                            kpi.trend === 'down' ? 'text-red-600' :
                                                'text-gray-500'
                                        }`}>
                                        {kpi.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                                        {kpi.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                                        {kpi.change}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Performance Trend Chart */}
                        <div>
                            <div className="mb-6">
                                <h3 className={`text-2xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                    }`}>Performance Trend</h3>
                                <p className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                    Your quiz performance over the last {analytics?.charts?.performanceTrend?.length || 0} attempts
                                </p>
                            </div>
                            <div className={`rounded-2xl p-6 ${currentTheme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                                }`}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={analytics?.charts?.performanceTrend || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'} />
                                        <XAxis
                                            dataKey="attempt"
                                            tickFormatter={(value) => `Quiz ${value}`}
                                            stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'}
                                        />
                                        <YAxis stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                border: currentTheme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                color: currentTheme === 'dark' ? '#f9fafb' : '#111827'
                                            }}
                                            formatter={(value, name) => [`${value}%`, 'Score']}
                                            labelFormatter={(label) => `Quiz ${label}`}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="score"
                                            stroke={CHART_COLORS.primary}
                                            fill={`${CHART_COLORS.primary}20`}
                                            strokeWidth={3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Topic Performance & Skill Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="mb-6">
                                    <h3 className={`text-xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                        }`}>Topic Performance</h3>
                                    <p className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                        Average scores by topic
                                    </p>
                                </div>
                                <div className={`rounded-2xl p-6 ${currentTheme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                                    }`}>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={analytics?.charts?.topicPerformance || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'} />
                                            <XAxis
                                                dataKey="topic"
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                                stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'}
                                            />
                                            <YAxis stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                    border: currentTheme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: currentTheme === 'dark' ? '#f9fafb' : '#111827'
                                                }}
                                            />
                                            <Bar
                                                dataKey="avgScore"
                                                fill={CHART_COLORS.secondary}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div>
                                <div className="mb-6">
                                    <h3 className={`text-xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                        }`}>Difficulty Distribution</h3>
                                    <p className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                        Performance by difficulty level
                                    </p>
                                </div>
                                <div className={`rounded-2xl p-6 ${currentTheme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                                    }`}>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={analytics?.charts?.skillProgression || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                dataKey="score"
                                                nameKey="level"
                                            >
                                                {(analytics?.charts?.skillProgression || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[index % DIFFICULTY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                    border: currentTheme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: currentTheme === 'dark' ? '#f9fafb' : '#111827'
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <h3 className={`text-xl font-bold mb-4 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                    }`}>Learning Progress Over Time</h3>
                                <div className={`rounded-2xl p-6 ${currentTheme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                                    }`}>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={analytics?.charts?.performanceTrend || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'} />
                                            <XAxis dataKey="date" stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                            <YAxis stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                    border: currentTheme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: currentTheme === 'dark' ? '#f9fafb' : '#111827'
                                                }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke={CHART_COLORS.primary}
                                                strokeWidth={3}
                                                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div>
                                <h3 className={`text-xl font-bold mb-4 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                    }`}>Skill Assessment</h3>
                                <div className={`rounded-2xl p-6 h-96 ${currentTheme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                                    }`}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={analytics?.charts?.skillProgression || []}>
                                            <PolarGrid stroke={currentTheme === 'dark' ? '#4b5563' : '#d1d5db'} />
                                            <PolarAngleAxis
                                                dataKey="level"
                                                tick={{ fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280' }}
                                            />
                                            <PolarRadiusAxis
                                                tick={{ fill: currentTheme === 'dark' ? '#9ca3af' : '#6b7280' }}
                                            />
                                            <Radar
                                                name="Skill Level"
                                                dataKey="score"
                                                stroke={CHART_COLORS.purple}
                                                fill={CHART_COLORS.purple}
                                                fillOpacity={0.3}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                    border: currentTheme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    color: currentTheme === 'dark' ? '#f9fafb' : '#111827'
                                                }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h3 className={`text-2xl font-bold mb-6 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                }`}>Recent Quiz Attempts</h3>
                            <div className="space-y-4">
                                {(analytics?.recentActivity || []).map((activity, index) => (
                                    <div key={activity.attemptId || index} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${currentTheme === 'dark'
                                            ? 'bg-gray-700/50 border border-gray-600'
                                            : 'bg-white border border-gray-200'
                                        }`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentTheme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-100'
                                            }`}>
                                            <BookOpen className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-white' : 'text-indigo-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-semibold ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                                }`}>{activity.topic}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${currentTheme === 'dark'
                                                        ? 'bg-gray-600 text-gray-300'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {activity.difficulty}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${currentTheme === 'dark'
                                                        ? 'bg-indigo-900/50 text-indigo-300'
                                                        : 'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                    {activity.score?.correct || 0}/{activity.score?.total || 0} questions
                                                </span>
                                                <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    {new Date(activity.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${activity.percentage >= 70
                                                ? currentTheme === 'dark'
                                                    ? 'bg-green-900/50 text-green-300'
                                                    : 'bg-green-100 text-green-700'
                                                : activity.percentage >= 50
                                                    ? currentTheme === 'dark'
                                                        ? 'bg-yellow-900/50 text-yellow-300'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    : currentTheme === 'dark'
                                                        ? 'bg-red-900/50 text-red-300'
                                                        : 'bg-red-100 text-red-700'
                                            }`}>
                                            {Math.round(activity.percentage)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-8">
                        {/* Strengths and Weaknesses */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className={`rounded-2xl p-6 border-l-4 border-green-500 ${currentTheme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                                }`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <CheckCircle className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                                        }`} />
                                    <h3 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                        }`}>Your Strengths</h3>
                                </div>
                                <div className="space-y-4">
                                    {(analytics?.insights?.strongestTopics || []).slice(0, 5).map((topic, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between mb-2">
                                                <span className={`font-medium ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                                                    }`}>{topic.topic}</span>
                                                <span className={`text-sm font-bold ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>{Math.round(topic.score)}%</span>
                                            </div>
                                            <div className={`w-full rounded-full h-2 overflow-hidden ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}>
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                                    style={{ width: `${Math.min(topic.score, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`rounded-2xl p-6 border-l-4 border-red-500 ${currentTheme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                                }`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <Target className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
                                        }`} />
                                    <h3 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                        }`}>Areas to Improve</h3>
                                </div>
                                <div className="space-y-4">
                                    {(analytics?.insights?.weakestTopics || []).slice(0, 5).map((topic, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between mb-2">
                                                <span className={`font-medium ${currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                                                    }`}>{topic.topic}</span>
                                                <span className={`text-sm font-bold ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>{Math.round(topic.score)}%</span>
                                            </div>
                                            <div className={`w-full rounded-full h-2 overflow-hidden ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}>
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                                                    style={{ width: `${Math.min(topic.score, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendations */}
                        <div>
                            <h3 className={`text-2xl font-bold mb-6 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                }`}>🤖 AI-Powered Recommendations</h3>
                            <div className="space-y-4">
                                {(analytics?.insights?.recommendations || []).map((rec, index) => (
                                    <div key={index} className={`rounded-2xl p-6 border-l-4 transition-all duration-300 hover:scale-[1.02] ${rec.priority === 'high'
                                            ? currentTheme === 'dark'
                                                ? 'border-red-500 bg-red-900/20'
                                                : 'border-red-500 bg-red-50'
                                            : rec.priority === 'medium'
                                                ? currentTheme === 'dark'
                                                    ? 'border-orange-500 bg-orange-900/20'
                                                    : 'border-orange-500 bg-orange-50'
                                                : currentTheme === 'dark'
                                                    ? 'border-green-500 bg-green-900/20'
                                                    : 'border-green-500 bg-green-50'
                                        }`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className={`p-3 rounded-xl flex-shrink-0 ${currentTheme === 'dark'
                                                        ? 'bg-indigo-600/20 text-indigo-400'
                                                        : 'bg-indigo-100 text-indigo-600'
                                                    }`}>
                                                    {rec.type === 'skill_building' && <Brain className="w-6 h-6" />}
                                                    {rec.type === 'topic_improvement' && <Target className="w-6 h-6" />}
                                                    {rec.type === 'consistency' && <TrendingUp className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-bold mb-2 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                                        }`}>{rec.title}</h4>
                                                    <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>{rec.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${rec.priority === 'high'
                                                        ? 'bg-red-100 text-red-800'
                                                        : rec.priority === 'medium'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {rec.priority}
                                                </span>
                                                <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${currentTheme === 'dark'
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                                                    }`}>
                                                    {rec.action}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Milestone */}
                        {analytics?.insights?.nextMilestone && (
                            <div className={`rounded-2xl p-6 border ${currentTheme === 'dark'
                                    ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700'
                                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <Star className={`w-8 h-8 ${currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                        }`} />
                                    <div>
                                        <h4 className={`font-bold ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                            }`}>Next Milestone</h4>
                                        <p className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                            }`}>{analytics.insights.nextMilestone}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-8">
                            <Trophy className={`w-8 h-8 ${currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                }`} />
                            <div>
                                <h3 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                    }`}>Your Achievements</h3>
                                <p className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                    Badges and milestones you've earned
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(analytics?.insights?.achievements || []).map((achievement, index) => (
                                <div key={index} className={`flex items-center gap-4 p-6 rounded-2xl border-2 border-green-500 transition-all duration-300 hover:scale-[1.02] ${currentTheme === 'dark'
                                        ? 'bg-green-900/20'
                                        : 'bg-green-50'
                                    }`}>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${currentTheme === 'dark'
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                            : 'bg-gradient-to-r from-orange-400 to-red-500'
                                        }`}>
                                        <Award className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                            }`}>{achievement.badge}</h4>
                                        <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                            }`}>{achievement.description}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <CheckCircle className={`w-6 h-6 ${currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                                            }`} />
                                    </div>
                                </div>
                            ))}

                            {/* Show message if no achievements */}
                            {(!analytics?.insights?.achievements || analytics.insights.achievements.length === 0) && (
                                <div className="col-span-2 text-center py-16">
                                    <Trophy className={`w-16 h-16 mx-auto mb-4 ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                        }`} />
                                    <h4 className={`text-xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                        }`}>No Achievements Yet</h4>
                                    <p className={`mb-6 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Keep taking quizzes to unlock your first achievement!</p>
                                    <button
                                        onClick={() => navigate('/quiz/interface')}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all duration-200"
                                    >
                                        Take a Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Data Update Info */}
            <div className={`mt-6 text-center text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                Last updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'Just now'} •
                Data range: {analytics?.dataRange || 'No data available'}
            </div>
        </div>
    );
};

export default Analytics;
