import React, { useState } from 'react'
import { X, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../Header/context/AuthContext'

interface AzureAuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup'
}

export function AzureAuthModal({ isOpen, onClose, defaultMode = 'signin' }: AzureAuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  const { login, signup } = useAuth()

  const handleSignIn = () => {
    login()
    onClose()
  }

  const handleSignUp = () => {
    signup()
    onClose()
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-24">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-blue-600" />
            </div>
            
            <p className="text-gray-600 mb-6">
              {mode === 'signin' 
                ? 'Sign in with your Microsoft account to access your dashboard and protected content.'
                : 'Create a new account using Microsoft authentication to get started.'
              }
            </p>
          </div>

          {/* Features */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">What you get:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Access to protected forms and dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Secure enterprise-grade authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Single sign-on across all services</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={mode === 'signin' ? handleSignIn : handleSignUp}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
              <path d="M11 0H0V11H11V0Z" fill="#F25022"/>
              <path d="M23 0H12V11H23V0Z" fill="#7FBA00"/>
              <path d="M11 12H0V23H11V12Z" fill="#00A4EF"/>
              <path d="M23 12H12V23H23V12Z" fill="#FFB900"/>
            </svg>
            <span>
              {mode === 'signin' ? 'Sign In with Microsoft' : 'Sign Up with Microsoft'}
            </span>
          </button>

          {/* Toggle Mode */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By continuing, you'll be redirected to Microsoft's secure login page. 
              Your credentials are never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
