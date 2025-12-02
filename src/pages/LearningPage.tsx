import React, { useEffect } from 'react'
import { useLearningAuth } from '../contexts/LearningAuthContext'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { BookOpen, Trophy, Star, CheckCircle } from 'lucide-react'

export function LearningPage() {
  const { user, profile, updateProgress, awardBadge } = useLearningAuth()

  useEffect(() => {
    // When user enters Stage 2, update their progress
    if (profile && profile.current_stage < 2) {
      updateProgress(2).catch(console.error)
    }
  }, [profile])

  const handleCompleteLesson = async () => {
    try {
      // Award points for completing a lesson
      await updateProgress(2, 10)
      alert('Great job! You earned 10 points!')
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleEarnBadge = async () => {
    try {
      await awardBadge('First Lesson Complete')
      alert('Congratulations! You earned a badge!')
    } catch (error) {
      console.error('Error awarding badge:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to Stage 2: Learning Hub
          </h1>
          <p className="text-blue-100 mb-4">
            Hello {profile?.full_name || user?.email}! Continue your learning journey.
          </p>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} />
                <span className="font-medium">Current Stage</span>
              </div>
              <p className="text-2xl font-bold">Stage {profile?.current_stage || 0}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={20} />
                <span className="font-medium">Total Score</span>
              </div>
              <p className="text-2xl font-bold">{profile?.total_score || 0} points</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} />
                <span className="font-medium">Badges Earned</span>
              </div>
              <p className="text-2xl font-bold">{profile?.badges?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Learning Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Learning Path
              </h2>
              <p className="text-gray-600 mb-6">
                This is your personalized learning area. Your progress is automatically saved!
              </p>

              {/* Sample Lesson */}
              <div className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Lesson 1: Getting Started
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Learn the fundamentals of entrepreneurship in Abu Dhabi.
                    </p>
                    <button
                      onClick={handleCompleteLesson}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Complete Lesson (+10 points)
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Achievement */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="text-green-600" size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Achievement: First Steps
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Complete your first lesson to earn this badge!
                    </p>
                    <button
                      onClick={handleEarnBadge}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Claim Badge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Completed Stages</span>
                    <span className="font-medium text-gray-900">
                      {profile?.completed_stages?.length || 0}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((profile?.completed_stages?.length || 0) / 10 * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {profile?.completed_stages && profile.completed_stages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Completed:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.completed_stages.map((stage) => (
                        <span 
                          key={stage}
                          className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          <CheckCircle size={12} />
                          Stage {stage}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Badges Card */}
            {profile?.badges && profile.badges.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Badges
                </h3>
                <div className="space-y-2">
                  {profile.badges.map((badge, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md"
                    >
                      <Trophy className="text-yellow-600" size={16} />
                      <span className="text-sm text-gray-700">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer isLoggedIn={true} />
    </div>
  )
}
