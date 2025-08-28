import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import { Cloud, Sun, CloudRain, CloudSnow, Users, Heart, Mountain, Sparkles, Briefcase, HelpCircle, Clock, Activity, X } from 'lucide-react';

const ScorePreviewPanel = ({ propertyId, onClose }) => {
  const [weather, setWeather] = useState('sunny');
  const [guestProfile, setGuestProfile] = useState('family');
  const [timeOfDay, setTimeOfDay] = useState('afternoon');
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('activities');

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', icon: Sun },
    { value: 'cloudy', label: 'Cloudy', icon: Cloud },
    { value: 'rainy', label: 'Rainy', icon: CloudRain },
    { value: 'cold', label: 'Cold', icon: CloudSnow }
  ];

  const profileOptions = [
    { value: 'family', label: 'Family', icon: Users },
    { value: 'couple', label: 'Couple', icon: Heart },
    { value: 'adventure', label: 'Adventure', icon: Mountain },
    { value: 'wellness', label: 'Wellness', icon: Sparkles },
    { value: 'business', label: 'Business', icon: Briefcase },
    { value: 'unknown', label: 'Unknown', icon: HelpCircle }
  ];

  const timeOptions = [
    { value: 'morning', label: 'Morning (6AM-12PM)', icon: Clock },
    { value: 'afternoon', label: 'Afternoon (12PM-6PM)', icon: Clock },
    { value: 'evening', label: 'Evening (6PM-10PM)', icon: Clock },
    { value: 'night', label: 'Night (10PM-6AM)', icon: Clock }
  ];

  useEffect(() => {
    if (propertyId) {
      calculateScores();
    }
  }, [weather, guestProfile, timeOfDay, propertyId]);

  const calculateScores = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch scores based on active tab
      const endpoint = activeTab === 'activities' 
        ? '/api/scoring/activities/calculate-scores'
        : activeTab === 'dining'
        ? '/api/scoring/dining/calculate-scores'
        : '/api/scoring/preview-recommendations';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId,
          weather,
          guestProfile,
          timeOfDay
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setScores(data);
      } else {
        console.error('Error response:', data);
        setScores(null);
      }
    } catch (error) {
      console.error('Error calculating scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    if (score >= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '😊';
    if (score >= 20) return '🤔';
    return '😕';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">TV App Recommendation Preview</h2>
              <p className="mt-1 text-blue-100">Preview how content will be scored and recommended in the TV app</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-50 border-b p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weather Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weather Condition</label>
              <div className="grid grid-cols-2 gap-2">
                {weatherOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setWeather(option.value)}
                      className={`flex items-center justify-center space-x-2 p-2 rounded-lg border transition-all ${
                        weather === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guest Profile Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guest Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {profileOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setGuestProfile(option.value)}
                      className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                        guestProfile === option.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      title={option.label}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs mt-1">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time of Day Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'activities'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => setActiveTab('dining')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'dining'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dining
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              TV App Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : scores ? (
            <div>
              {/* Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeTab === 'activities' && 'Activity Recommendations'}
                      {activeTab === 'dining' && 'Dining Recommendations'}
                      {activeTab === 'preview' && 'TV App Recommendations'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {weather} weather • {guestProfile} profile • {timeOfDay}
                    </p>
                  </div>
                  {scores.topRecommendations && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {scores.topRecommendations.length}
                      </p>
                      <p className="text-xs text-gray-600">Top Picks</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                {(activeTab === 'preview' ? scores?.recommendations : 
                  activeTab === 'activities' ? scores?.activities :
                  scores?.dining || [])?.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`border rounded-lg p-4 transition-all ${
                      index < 5 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-gray-400">
                            #{index + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.category || item.cuisineType || item.type}
                              {item.location?.distanceFromProperty && 
                                ` • ${item.location.distanceFromProperty}km away`}
                            </p>
                          </div>
                        </div>
                        {item.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Score Display */}
                      <div className="ml-4 text-center">
                        <div className={`px-4 py-2 rounded-lg ${getScoreColor(item.score)}`}>
                          <div className="text-2xl font-bold">{item.score}</div>
                          <div className="text-xs uppercase tracking-wide">Score</div>
                        </div>
                        <div className="mt-1 text-2xl">{getScoreEmoji(item.score)}</div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    {item.breakdown && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <span className="text-gray-500">Weather</span>
                            <div className="font-semibold">{item.breakdown.weather > 0 ? '+' : ''}{item.breakdown.weather}</div>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-500">Profile</span>
                            <div className="font-semibold">{item.breakdown.profile > 0 ? '+' : ''}{item.breakdown.profile}</div>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-500">Time</span>
                            <div className="font-semibold">{item.breakdown.time > 0 ? '+' : ''}{item.breakdown.time || item.breakdown.mealTime || 0}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show in TV indicator */}
                    {index < 5 && (
                      <div className="mt-3 flex items-center text-sm text-blue-600">
                        <Activity className="h-4 w-4 mr-1" />
                        Will show in TV app
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select conditions to preview recommendations
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScorePreviewPanel;