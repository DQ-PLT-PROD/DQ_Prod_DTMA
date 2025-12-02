import React, { useState } from 'react'
import { Lock } from 'lucide-react'
import { AuthModal } from './AuthModal'

interface SignInPromptProps {
  title?: string
  message?: string
  className?: string
}

/**
 * A reusable component to prompt users to sign in
 * Use this anywhere you want to encourage authentication
 */
export function SignInPrompt({ 
  title = "Sign In to Continue",
  message = "Create an account to track your progress and earn badges.",
  className = ""
}: SignInPromptProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 text-center ${className}`}>
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-blue-600" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Sign In / Sign Up
        </button>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
