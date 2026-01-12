import React, { useState } from 'react'
import { Lock, Play, CheckCircle } from 'lucide-react'
import { useAuth } from '../../auth/context/AuthContext'

interface LearningStageGateProps {
  stage: number
  title: string
  description: string
  requiredStage?: number
  children: React.ReactNode
  onStageComplete?: (stage: number, score?: number) => void
}

export function LearningStageGate({
  stage,
  title,
  description,
  requiredStage = 0,
  children,
  onStageComplete
}: LearningStageGateProps) {
  const { user, login } = useAuth()
  const [isUnlocked, setIsUnlocked] = useState(false)

  const isAuthenticated = !!user
  const canAccess = isAuthenticated

  const handleUnlock = () => {
    if (!isAuthenticated) {
      login()
      return
    }

    setIsUnlocked(true)
  }

  const handleStageComplete = async (score?: number) => {
    if (!isAuthenticated) return

    try {
      onStageComplete?.(stage, score)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  // If stage is unlocked, show content
  if (isUnlocked) {
    return (
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          onComplete: handleStageComplete
        })}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="mb-6">
          {canAccess ? (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play size={32} className="text-blue-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-gray-400" />
            </div>
          )}

          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{description}</p>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Sign in to track your progress and resume your learning journey
            </p>
            <button
              onClick={handleUnlock}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <button
            onClick={handleUnlock}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Stage {stage}
          </button>
        )}
      </div>
    </>
  )
}