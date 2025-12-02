# Integration Examples

Quick copy-paste examples for integrating authentication into your app.

## Example 1: Show Content Only to Signed-In Users

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'
import { SignInPrompt } from '../components/auth/SignInPrompt'

function MyPage() {
  const { user, profile } = useLearningAuth()

  if (!user) {
    return <SignInPrompt message="Sign in to access this content" />
  }

  return (
    <div>
      <h1>Welcome {profile?.full_name}!</h1>
      <p>Your exclusive content here...</p>
    </div>
  )
}
```

## Example 2: Protect a Route

```tsx
// In AppRouter.tsx
import { LearningProtectedRoute } from './components/LearningProtectedRoute'
import MyProtectedPage from './pages/MyProtectedPage'

<Route 
  path="/my-protected-page" 
  element={
    <LearningProtectedRoute>
      <MyProtectedPage />
    </LearningProtectedRoute>
  } 
/>
```

## Example 3: Show Different Content Based on Auth

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'

function CourseCard({ course }) {
  const { user } = useLearningAuth()

  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      
      {user ? (
        <button onClick={() => startCourse(course.id)}>
          Start Course
        </button>
      ) : (
        <button onClick={() => showAuthModal()}>
          Sign In to Start
        </button>
      )}
    </div>
  )
}
```

## Example 4: Track Progress on Completion

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'

function LessonPage() {
  const { updateProgress } = useLearningAuth()
  const [completed, setCompleted] = useState(false)

  const handleComplete = async () => {
    try {
      // Update to stage 3, award 15 points
      await updateProgress(3, 15)
      setCompleted(true)
      alert('Lesson complete! +15 points')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save progress')
    }
  }

  return (
    <div>
      <h1>Lesson Content</h1>
      {/* Your lesson content */}
      
      {!completed && (
        <button onClick={handleComplete}>
          Mark as Complete
        </button>
      )}
    </div>
  )
}
```

## Example 5: Award Badge on Achievement

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'

function QuizPage() {
  const { awardBadge, profile } = useLearningAuth()

  const handleQuizComplete = async (score) => {
    if (score >= 80) {
      try {
        await awardBadge('Quiz Master')
        alert('Congratulations! You earned the Quiz Master badge!')
      } catch (error) {
        console.error('Error awarding badge:', error)
      }
    }
  }

  return (
    <div>
      <h1>Quiz</h1>
      {/* Quiz content */}
      
      <div className="badges">
        <h3>Your Badges</h3>
        {profile?.badges.map(badge => (
          <span key={badge} className="badge">{badge}</span>
        ))}
      </div>
    </div>
  )
}
```

## Example 6: Show Progress Bar

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'

function ProgressBar() {
  const { profile } = useLearningAuth()
  
  const totalStages = 10
  const completedCount = profile?.completed_stages?.length || 0
  const percentage = (completedCount / totalStages) * 100

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p>{completedCount} of {totalStages} stages complete</p>
    </div>
  )
}
```

## Example 7: Conditional Navigation

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'
import { useNavigate } from 'react-router-dom'

function NavigationMenu() {
  const { user, profile } = useLearningAuth()
  const navigate = useNavigate()

  const handleLearningClick = () => {
    if (user) {
      navigate('/learning')
    } else {
      // Show auth modal or redirect
      alert('Please sign in to access learning content')
    }
  }

  return (
    <nav>
      <button onClick={() => navigate('/')}>Home</button>
      <button onClick={() => navigate('/courses')}>Courses</button>
      <button onClick={handleLearningClick}>
        My Learning {profile?.current_stage > 0 && `(Stage ${profile.current_stage})`}
      </button>
    </nav>
  )
}
```

## Example 8: User Profile Display

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'
import { Trophy, Star, BookOpen } from 'lucide-react'

function UserProfile() {
  const { user, profile } = useLearningAuth()

  if (!user || !profile) return null

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>{profile.full_name || 'Learner'}</h2>
        <p>{user.email}</p>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <BookOpen size={24} />
          <span>Stage {profile.current_stage}</span>
        </div>
        
        <div className="stat">
          <Star size={24} />
          <span>{profile.total_score} points</span>
        </div>
        
        <div className="stat">
          <Trophy size={24} />
          <span>{profile.badges.length} badges</span>
        </div>
      </div>

      <div className="badges-section">
        <h3>Badges Earned</h3>
        {profile.badges.length > 0 ? (
          <div className="badges-list">
            {profile.badges.map((badge, index) => (
              <div key={index} className="badge-item">
                <Trophy size={16} />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No badges yet. Complete lessons to earn badges!</p>
        )}
      </div>
    </div>
  )
}
```

## Example 9: Loading State

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'

function MyComponent() {
  const { user, profile, loading } = useLearningAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <SignInPrompt />
  }

  return (
    <div>
      <h1>Welcome back, {profile?.full_name}!</h1>
      {/* Your content */}
    </div>
  )
}
```

## Example 10: Stage-Based Access Control

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'

function AdvancedLesson() {
  const { user, profile } = useLearningAuth()

  // Require user to complete stage 5 before accessing
  const requiredStage = 5
  const hasAccess = profile?.completed_stages?.includes(requiredStage)

  if (!user) {
    return <SignInPrompt message="Sign in to access lessons" />
  }

  if (!hasAccess) {
    return (
      <div className="locked-content">
        <h2>🔒 Lesson Locked</h2>
        <p>Complete Stage {requiredStage} to unlock this lesson.</p>
        <p>Current Stage: {profile?.current_stage}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Advanced Lesson</h1>
      {/* Lesson content */}
    </div>
  )
}
```

## Example 11: Sign In Button Anywhere

```tsx
import { useState } from 'react'
import { useLearningAuth } from '../contexts/LearningAuthContext'
import { AuthModal } from '../components/auth/AuthModal'

function MyComponent() {
  const { user } = useLearningAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (user) {
    return <div>You're signed in!</div>
  }

  return (
    <>
      <button onClick={() => setShowAuth(true)}>
        Sign In to Continue
      </button>
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </>
  )
}
```

## Example 12: Auto-Save Progress

```tsx
import { useEffect } from 'react'
import { useLearningAuth } from '../contexts/LearningAuthContext'

function LearningActivity() {
  const { user, updateProgress } = useLearningAuth()
  const [currentScore, setCurrentScore] = useState(0)

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      if (currentScore > 0) {
        try {
          await updateProgress(2, currentScore)
          setCurrentScore(0) // Reset after saving
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, currentScore, updateProgress])

  const handleAnswer = (points) => {
    setCurrentScore(prev => prev + points)
  }

  return (
    <div>
      <h1>Learning Activity</h1>
      <p>Current Score: {currentScore}</p>
      {/* Activity content */}
    </div>
  )
}
```

## Example 13: Leaderboard

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/auth'
import { useLearningAuth } from '../contexts/LearningAuthContext'

function Leaderboard() {
  const { profile } = useLearningAuth()
  const [topLearners, setTopLearners] = useState([])

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from('learner_profiles')
      .select('full_name, total_score, badges')
      .order('total_score', { ascending: false })
      .limit(10)

    if (!error) {
      setTopLearners(data)
    }
  }

  return (
    <div className="leaderboard">
      <h2>Top Learners</h2>
      <ol>
        {topLearners.map((learner, index) => (
          <li 
            key={index}
            className={learner.total_score === profile?.total_score ? 'current-user' : ''}
          >
            <span className="rank">#{index + 1}</span>
            <span className="name">{learner.full_name}</span>
            <span className="score">{learner.total_score} pts</span>
            <span className="badges">{learner.badges.length} 🏆</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
```

## Example 14: Achievement Notification

```tsx
import { useState } from 'react'
import { useLearningAuth } from '../contexts/LearningAuthContext'

function AchievementNotification() {
  const [show, setShow] = useState(false)
  const [achievement, setAchievement] = useState('')

  const showAchievement = (name) => {
    setAchievement(name)
    setShow(true)
    setTimeout(() => setShow(false), 3000)
  }

  if (!show) return null

  return (
    <div className="achievement-popup">
      <div className="achievement-content">
        <span className="trophy">🏆</span>
        <h3>Achievement Unlocked!</h3>
        <p>{achievement}</p>
      </div>
    </div>
  )
}

// Usage
function SomeComponent() {
  const { awardBadge } = useLearningAuth()
  
  const handleComplete = async () => {
    await awardBadge('First Steps')
    showAchievement('First Steps')
  }
}
```

## Example 15: Profile Completion Prompt

```tsx
import { useLearningAuth } from '../contexts/LearningAuthContext'

function ProfileCompletionPrompt() {
  const { profile } = useLearningAuth()

  const isProfileComplete = profile?.full_name && profile?.email

  if (isProfileComplete) return null

  return (
    <div className="profile-prompt">
      <h3>Complete Your Profile</h3>
      <p>Add your information to get personalized recommendations</p>
      <button>Complete Profile</button>
    </div>
  )
}
```

---

## CSS Examples

### Progress Bar Styles

```css
.progress-container {
  width: 100%;
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
}
```

### Badge Styles

```css
.badge-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 20px;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}
```

### Achievement Popup

```css
.achievement-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.achievement-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```
