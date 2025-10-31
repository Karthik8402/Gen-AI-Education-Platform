import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api'
import {
  User,
  Calendar,
  GraduationCap,
  Brain,
  BookOpen,
  BarChart3,
  Clock,
  Trophy,
  Star,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

// ✅ Subject options array
const subjectOptions = [
  'Programming',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Economics',
  'Business'
];

export default function Profile() {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state - starts empty, populated by API
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    department: '',
    learningStyle: 'visual',
    educationLevel: 'undergraduate',
    subjects: []
  });

  // Load profile data from API
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/student/profile/me');

      if (response.data.status === 'success') {
        const profileData = response.data.profile;
        setProfile(profileData);

        setForm({
          name: profileData.name || '',
          email: profileData.email || '',
          age: profileData.age || '',
          department: profileData.department || '',
          learningStyle: profileData.learningstyle || 'visual',
          educationLevel: profileData.educationlevel || 'undergraduate',
          subjects: profileData.preferredtopics || []
        });
      }
    } catch (err) {
      console.error('Profile load error:', err);

      if (err.response?.status === 404) {
        setError('Profile not found. Please complete your profile setup.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Unable to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSkillConfig = (skillLevel) => {
    const level = (skillLevel || 'beginner').toLowerCase();

    switch (level) {
      case 'beginner':
        return {
          emoji: '🌱',
          color: 'green',
          bgDark: 'bg-green-900/30',
          bgLight: 'bg-green-100',
          textDark: 'text-green-300',
          textLight: 'text-green-800',
          borderDark: 'border-green-700',
          borderLight: 'border-green-200',
          gradient: 'from-green-500 to-emerald-600'
        };
      case 'intermediate':
        return {
          emoji: '🚀',
          color: 'blue',
          bgDark: 'bg-blue-900/30',
          bgLight: 'bg-blue-100',
          textDark: 'text-blue-300',
          textLight: 'text-blue-800',
          borderDark: 'border-blue-700',
          borderLight: 'border-blue-200',
          gradient: 'from-blue-500 to-indigo-600'
        };
      case 'advanced':
      case 'pro':
        return {
          emoji: '⚡',
          color: 'purple',
          bgDark: 'bg-purple-900/30',
          bgLight: 'bg-purple-100',
          textDark: 'text-purple-300',
          textLight: 'text-purple-800',
          borderDark: 'border-purple-700',
          borderLight: 'border-purple-200',
          gradient: 'from-purple-500 to-violet-600'
        };
      case 'expert':
        return {
          emoji: '👑',
          color: 'yellow',
          bgDark: 'bg-yellow-900/30',
          bgLight: 'bg-yellow-100',
          textDark: 'text-yellow-300',
          textLight: 'text-yellow-800',
          borderDark: 'border-yellow-700',
          borderLight: 'border-yellow-200',
          gradient: 'from-yellow-500 to-orange-600'
        };
      default:
        return {
          emoji: '🌱',
          color: 'green',
          bgDark: 'bg-green-900/30',
          bgLight: 'bg-green-100',
          textDark: 'text-green-300',
          textLight: 'text-green-800',
          borderDark: 'border-green-700',
          borderLight: 'border-green-200',
          gradient: 'from-green-500 to-emerald-600'
        };
    }
  };

  // Submit profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const requiredFields = {
      name: 'Full name',
      age: 'Age',
      department: 'Department'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !form[field] || form[field].toString().trim() === '')
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      return setError(`Please fill in: ${missingFields.join(', ')}`);
    }

    const age = parseInt(form.age);
    if (isNaN(age) || age < 10 || age > 99) {
      return setError('Please enter a valid age between 10 and 99');
    }

    setSaving(true);
    try {
      const response = await api.post('/api/student/profile', {
        name: form.name.trim(),
        age: parseInt(form.age),
        department: form.department.trim(),
        learningStyle: form.learningStyle,
        educationLevel: form.educationLevel,
        subjects: Array.isArray(form.subjects) ? form.subjects : []
      });

      if (response.data.status === 'success') {
        setSuccess(response.data.message || 'Profile updated successfully!');
        setEditing(false);
        await loadProfile();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Handle subject selection
  const handleSubjectChange = (subject) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        age: profile.age || '',
        department: profile.department || '',
        learningStyle: profile.learningstyle || 'visual',
        educationLevel: profile.educationlevel || 'undergraduate',
        subjects: profile.preferredtopics || []
      });
    }
  };

  // Load profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-300 flex items-center justify-center ${currentTheme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}>
        <div className="text-center">
          <div className="relative">
            <div className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4 transition-colors duration-300 ${currentTheme === 'dark'
              ? 'border-indigo-800 border-t-indigo-400'
              : 'border-indigo-200 border-t-indigo-600'
              }`}></div>
            <Brain className={`w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
              }`} />
          </div>
          <p className={`text-lg font-medium mb-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>Loading Your Profile</p>
          <p className={`transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Getting your learning data ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${currentTheme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700'
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
      <div className="max-w-7xl mx-auto p-6 py-12">

        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-4xl font-bold mb-2 transition-all duration-300 ${currentTheme === 'dark'
                ? 'bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
                }`}>
                Your Profile
              </h1>
              <p className={`text-xl transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Manage your learning profile and track your progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => editing ? handleCancel() : setEditing(true)}
                className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${editing
                  ? currentTheme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
              >
                {editing ? (
                  <>
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className={`border-l-4 p-4 rounded-lg mb-6 transition-colors duration-300 ${currentTheme === 'dark'
            ? 'bg-red-900/20 border-red-400 text-red-300'
            : 'bg-red-50 border-red-400 text-red-700'
            }`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className={`flex items-center p-4 border-l-4 border-green-400 rounded-lg mb-8 transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
            }`}>
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <p className={`font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-green-300' : 'text-green-700'
              }`}>{success}</p>
          </div>
        )}

        {/* Profile Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Skill Level Card */}
          <div className={`rounded-3xl shadow-xl border p-8 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ${currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Current Skill Level</h3>

            {(() => {
              const skillConfig = getSkillConfig(profile?.currentskilllevel);
              return (
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-xl border-2 font-semibold shadow-sm transition-colors duration-300 px-2 py-1 text-xs ${currentTheme === 'dark'
                      ? `${skillConfig.bgDark} ${skillConfig.textDark} ${skillConfig.borderDark}`
                      : `${skillConfig.bgLight} ${skillConfig.textLight} ${skillConfig.borderLight}`
                    }`}>
                    <span>{skillConfig.emoji}</span>
                    <span className="capitalize">{profile?.currentskilllevel || 'Beginner'}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-16 rounded-full h-2 shadow-inner transition-colors duration-300 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                      <div
                        className={`bg-gradient-to-r ${skillConfig.gradient} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${(profile?.skillconfidence || 0.7) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      {Math.round((profile?.skillconfidence || 0.7) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })()}

            <p className={`text-xs mt-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
              Updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Average Score Card */}
          <div className={`rounded-3xl shadow-xl border p-8 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ${currentTheme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Average Score</h3>
            <p className={`text-3xl font-bold mb-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
              {profile?.avgscore || 0}%
            </p>
            <p className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              {profile?.totalquizzes || 0} quizzes completed
            </p>
          </div>

          {/* Learning Streak Card */}
          <div className={`rounded-3xl shadow-xl border p-8 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ${currentTheme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Learning Streak</h3>
            <p className={`text-3xl font-bold mb-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{profile?.learningstreak || 0}</p>
            <p className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              {profile?.learningstreak > 0 ? 'Keep it going!' : 'Start your streak!'}
            </p>
          </div>

          {/* Member Since Card */}
          <div className={`rounded-3xl shadow-xl border p-8 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ${currentTheme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-2 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Member Since</h3>
            <p className={`text-lg font-bold mb-1 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
              {profile?.createdat ? new Date(profile.createdat).toLocaleDateString() : 'N/A'}
            </p>
            <p className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Active learner</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className={`rounded-3xl shadow-xl border backdrop-blur-sm overflow-hidden transition-all duration-300 ${currentTheme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
          }`}>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-white mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                <p className="text-indigo-100 mt-1">
                  {editing ? 'Update your profile information' : 'Your current profile details'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name Field */}
                <div>
                  <label className={`flex items-center text-sm font-semibold mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    <User className="w-4 h-4 mr-2" />
                    Full Name *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300 ${currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                        : 'border-gray-200 bg-white text-gray-900'
                        }`}
                      placeholder="Enter your full name"
                      required
                    />
                  ) : (
                    <div className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors duration-300 ${currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-gray-50 border-gray-100 text-gray-900'
                      }`}>
                      {form.name}
                    </div>
                  )}
                </div>

                {/* Age Field */}
                <div>
                  <label className={`flex items-center text-sm font-semibold mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Age *
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      min="10"
                      max="99"
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300 ${currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                        : 'border-gray-200 bg-white text-gray-900'
                        }`}
                      placeholder="Your age"
                      required
                    />
                  ) : (
                    <div className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors duration-300 ${currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-gray-50 border-gray-100 text-gray-900'
                      }`}>
                      {form.age} years old
                    </div>
                  )}
                </div>

                {/* Department Field */}
                <div>
                  <label className={`flex items-center text-sm font-semibold mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Department *
                  </label>
                  {editing ? (
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300 ${currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                        : 'border-gray-200 bg-white text-gray-900'
                        }`}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Business">Business</option>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors duration-300 ${currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-gray-50 border-gray-100 text-gray-900'
                      }`}>
                      {form.department}
                    </div>
                  )}
                </div>

                {/* Learning Style Field */}
                <div>
                  <label className={`flex items-center text-sm font-semibold mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    <Brain className="w-4 h-4 mr-2" />
                    Learning Style
                  </label>
                  {editing ? (
                    <select
                      name="learningStyle"
                      value={form.learningStyle}
                      onChange={handleChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300 ${currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                        : 'border-gray-200 bg-white text-gray-900'
                        }`}
                    >
                      <option value="visual">🎨 Visual (diagrams, charts)</option>
                      <option value="auditory">🎧 Auditory (discussions, audio)</option>
                      <option value="kinesthetic">✋ Kinesthetic (hands-on)</option>
                      <option value="reading">📖 Reading/Writing</option>
                    </select>
                  ) : (
                    <div className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors duration-300 ${currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-gray-50 border-gray-100 text-gray-900'
                      }`}>
                      {form.learningStyle === 'visual' && '🎨 Visual Learning'}
                      {form.learningStyle === 'auditory' && '🎧 Auditory Learning'}
                      {form.learningStyle === 'kinesthetic' && '✋ Kinesthetic Learning'}
                      {form.learningStyle === 'reading' && '📖 Reading/Writing'}
                    </div>
                  )}
                </div>

                {/* Education Level Field */}
                <div className="md:col-span-2">
                  <label className={`flex items-center text-sm font-semibold mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Education Level
                  </label>
                  {editing ? (
                    <select
                      name="educationLevel"
                      value={form.educationLevel}
                      onChange={handleChange}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300 ${currentTheme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                        : 'border-gray-200 bg-white text-gray-900'
                        }`}
                    >
                      <option value="high_school">🎓 High School</option>
                      <option value="undergraduate">🎓 Undergraduate</option>
                      <option value="graduate">🎓 Graduate</option>
                      <option value="postgraduate">🎓 Postgraduate</option>
                    </select>
                  ) : (
                    <div className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-colors duration-300 ${currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-gray-50 border-gray-100 text-gray-900'
                      }`}>
                      🎓 {form.educationLevel.charAt(0).toUpperCase() + form.educationLevel.slice(1).replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Subjects of Interest */}
              {editing && (
                <div>
                  <label className={`block text-sm font-semibold mb-4 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Subjects of Interest (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {subjectOptions.map(subject => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectChange(subject)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${form.subjects.includes(subject)
                          ? currentTheme === 'dark'
                            ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300 transform scale-105'
                            : 'border-indigo-500 bg-indigo-50 text-indigo-700 transform scale-105'
                          : currentTheme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Display subjects when not editing */}
              {!editing && form.subjects.length > 0 && (
                <div>
                  <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Subjects of Interest
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.subjects.map(subject => (
                      <span
                        key={subject}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${currentTheme === 'dark'
                          ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-700'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {editing && (
                <div className={`flex justify-between items-center pt-8 border-t transition-colors duration-300 ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={`flex items-center px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 ${currentTheme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/quiz/interface"
            className={`group rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
              }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3 className={`font-semibold mb-2 transition-colors duration-300 ${currentTheme === 'dark'
              ? 'text-gray-100 group-hover:text-indigo-400'
              : 'text-gray-900 group-hover:text-indigo-600'
              }`}>Take a Quiz</h3>
            <p className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Test your knowledge and improve your skill level</p>
          </Link>

          <Link
            to="/analytics"
            className={`group rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
              }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-green-500 group-hover:translate-x-1 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3 className={`font-semibold mb-2 transition-colors duration-300 ${currentTheme === 'dark'
              ? 'text-gray-100 group-hover:text-green-400'
              : 'text-gray-900 group-hover:text-green-600'
              }`}>View Analytics</h3>
            <p className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Detailed insights into your learning progress</p>
          </Link>

          <Link
            to="/quiz/history"
            className={`group rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${currentTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
              }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3 className={`font-semibold mb-2 transition-colors duration-300 ${currentTheme === 'dark'
              ? 'text-gray-100 group-hover:text-purple-400'
              : 'text-gray-900 group-hover:text-purple-600'
              }`}>Quiz History</h3>
            <p className={`text-sm transition-colors duration-300 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Review your past quiz attempts and results</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
