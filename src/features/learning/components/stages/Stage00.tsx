import React, { useState } from 'react'
import { CheckCircle, ArrowRight, BookOpen } from 'lucide-react'

interface Stage00Props {
  onComplete?: (score?: number) => void
  isCompleted?: boolean
}

export function Stage00({ onComplete, isCompleted }: Stage00Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const steps = [
    {
      title: "Welcome to Your Learning Journey",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Welcome! This is Stage 00 - your introduction to the learning platform. 
            Here you'll learn the basics and get familiar with how the system works.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What you'll learn:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• How to navigate the learning platform</li>
              <li>• Understanding the stage system</li>
              <li>• How progress tracking works</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Understanding Stages",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Our learning platform is organized into stages. Each stage builds upon the previous one.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                0
              </div>
              <div>
                <div className="font-medium">Stage 00 - Introduction</div>
                <div className="text-sm text-gray-500">Learn the basics</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                1
              </div>
              <div>
                <div className="font-medium">Stage 01 - Fundamentals</div>
                <div className="text-sm text-gray-500">Core concepts</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                2
              </div>
              <div>
                <div className="font-medium">Stage 02 - Advanced Learning</div>
                <div className="text-sm text-gray-500">Deep dive into topics</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quick Knowledge Check",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Let's test your understanding with a simple question:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-3">What is the purpose of the stage system?</h4>
            <div className="space-y-2">
              {[
                "To make learning more difficult",
                "To organize learning in a progressive structure",
                "To limit access to content",
                "To confuse learners"
              ].map((option, index) => (
                <label key={index} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="question1"
                    value={option}
                    checked={answers[0] === option}
                    onChange={(e) => setAnswers({ ...answers, 0: e.target.value })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete the stage
      const score = answers[0] === "To organize learning in a progressive structure" ? 10 : 5
      onComplete?.(score)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = currentStep < 2 || answers[0]

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stage 00: Introduction</h2>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {steps[currentStep].title}
        </h3>
        {steps[currentStep].content}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <CheckCircle size={18} />
              Complete Stage
            </>
          ) : (
            <>
              Next
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {isCompleted && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle size={18} />
            <span className="font-medium">Stage completed!</span>
          </div>
        </div>
      )}
    </div>
  )
}