import React from 'react'
import { Lock, ArrowRight, User, Trophy, BookOpen } from 'lucide-react'
import { useAuth } from '../Header/context/AuthContext'

interface AuthGateProps {
  onContinueToStage2?: () => void
  className?: string
}

export function AuthGate({ onContinueToStage2, className = '' }: AuthGateProps) {
  const { user, login } = useAuth()

  const handleSignIn = () => {
    login()
  }

  const handleContinue = () => {
    if (onContinueToStage2) {
      onContinueToStage2()
    }
  }

  // If user is already authenticated, show continue button
  if (user) {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-green-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user.name || 'Learner'}!
          </h3>
          
          <p className="text-gray-600 mb-6">
            You're signed in and ready to continue your learning journey.
          </p>

          <button
            onClick={handleContinue}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            Continue to Stage 2
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  // Show sign-in prompt for unauthenticated users
  return (
    <>
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 text-center ${className}`}>
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} className="text-blue-600" />
        </div>
        
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Ready for Stage 2?
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Sign in to unlock advanced learning content, track your progress, and earn badges as you complete each stage.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Resume Learning</h4>
            <p className="text-sm text-gray-600">Pick up where you left off</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Track Progress</h4>
            <p className="text-sm text-gray-600">See your scores and achievements</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Personal Profile</h4>
            <p className="text-sm text-gray-600">Build your learning profile</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full sm:w-auto"
          >
            Sign In to Continue
          </button>
          
          <div className="text-sm text-gray-500">
            Don't have an account? Sign up when you click above!
          </div>
        </div>
      </div>
    </>
  )
}