import React, { useState } from 'react'
import { Lock, Play, CheckCircle } from 'lucide-react'
import { useLearningAuth } from '../../contexts/LearningAuthContext'
import { AuthModal } from '../auth/AuthModal'

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
  const { user, profile, updateProgress } = useLearningAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  const isAuthenticated = !!user && !!profile
  const hasCompletedRequiredStage = profile?.completed_stages.includes(requiredStage) || requiredStage === 0
  const hasCompletedCurrentStage = profile?.completed_stages.includes(stage)
  const canAccess = isAuthenticated && hasCompletedRequiredStage

  const handleUnlock = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    
    if (canAccess) {
      setIsUnlocked(true)
    }
  }

  const handleStageComplete = async (score?: number) => {
    if (!isAuthenticated) return
    
    try {
      await updateProgress(stage, score)
      onStageComplete?.(stage, score)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  // If stage is unlocked or user has completed it, show content
  if (isUnlocked || hasCompletedCurrentStage) {
    return (
      <div className="relative">
        {hasCompletedCurrentStage && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <CheckCircle size={16} />
              Completed
            </div>
          </div>
        )}
        {React.cloneElement(children as React.ReactElement, { 
          onComplete: handleStageComplete,
          isCompleted: hasCompletedCurrentStage 
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
        ) : !hasCompletedRequiredStage ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Complete Stage {requiredStage} to unlock this stage
            </p>
            <div className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-medium">
              Locked
            </div>
          </div>
        ) : (
          <button
            onClick={handleUnlock}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Stage {stage}
          </button>
        )}

        {profile && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Your Progress: Stage {profile.current_stage} • {profile.total_score} points
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}