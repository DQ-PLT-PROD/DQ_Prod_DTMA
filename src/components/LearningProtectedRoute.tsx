import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLearningAuth } from '../contexts/LearningAuthContext'
import { AuthModal } from './auth/AuthModal'

interface LearningProtectedRouteProps {
  children: React.ReactNode
}

export function LearningProtectedRoute({ children }: LearningProtectedRouteProps) {
  const { user, loading } = useLearningAuth()
  const [showAuthModal, setShowAuthModal] = useState(!user && !loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access Stage 2 learning content and track your progress.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="signin"
        />
      </>
    )
  }

  return <>{children}</>
}
