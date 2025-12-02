import React, { useState, useEffect } from 'react'
import { User, LogOut, Trophy, BookOpen, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLearningAuth } from '../../contexts/LearningAuthContext'
import { AuthModal } from './AuthModal'

interface LearningAuthButtonProps {
  className?: string
  showProgress?: boolean
}

export function LearningAuthButton({ className = '', showProgress = true }: LearningAuthButtonProps) {
  const { user, profile, signOut, loading } = useLearningAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [forceShowButton, setForceShowButton] = useState(false)
  const navigate = useNavigate()
  
  // Debug: Log the auth state
  console.log('LearningAuthButton state:', { user: !!user, profile: !!profile, loading })
  
  // Fallback: If loading takes more than 3 seconds, show the button anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing button display')
        setForceShowButton(true)
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [loading])

  const handleSignOut = async () => {
    try {
      console.log('Signing out...')
      await signOut()
      setShowDropdown(false)
      console.log('Sign out successful! Redirecting to home...')
      // Redirect to home page after sign out
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  // Show loading only if not forced and still loading
  if (loading && !forceShowButton) {
    return (
      <div className={`flex items-center gap-2 bg-gray-200 text-gray-500 px-4 py-2 rounded-full ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className={`flex items-center gap-2 bg-blue-600 text-white px-3 py-2 md:px-4 rounded-full hover:bg-blue-700 transition-colors text-sm ${className}`}
        >
          <User size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="font-medium hidden sm:inline">Sign In</span>
          <span className="font-medium sm:hidden">Sign In</span>
        </button>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 md:gap-3 bg-white border border-gray-200 rounded-full px-2 py-1.5 md:px-4 md:py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User size={14} className="text-blue-600 md:w-4 md:h-4" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs md:text-sm font-medium text-gray-900">
            {profile.full_name || user.email?.split('@')[0]}
          </div>
          {showProgress && (
            <div className="text-[10px] md:text-xs text-gray-500">
              Stage {profile.current_stage} • {profile.total_score} pts
            </div>
          )}
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {profile.full_name || 'Learner'}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
          </div>

          {showProgress && (
            <div className="p-4 border-b border-gray-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">Current Stage</span>
                  </div>
                  <span className="text-sm text-gray-600">Stage {profile.current_stage}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm font-medium">Total Score</span>
                  </div>
                  <span className="text-sm text-gray-600">{profile.total_score} points</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-green-600" />
                    <span className="text-sm font-medium">Badges</span>
                  </div>
                  <span className="text-sm text-gray-600">{profile.badges.length}</span>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((profile.completed_stages.length / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {profile.completed_stages.length} of 10 stages completed
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}