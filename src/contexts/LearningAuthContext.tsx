import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authService, LearnerProfile, supabase } from '../lib/supabase/auth'

interface LearningAuthContextType {
  user: User | null
  profile: LearnerProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProgress: (stage: number, score?: number) => Promise<void>
  awardBadge: (badgeName: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const LearningAuthContext = createContext<LearningAuthContextType | undefined>(undefined)

export function LearningAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getSession().then(async (session) => {
      console.log('Initial session check:', session ? 'User logged in' : 'No user')
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name)
      }
      setLoading(false)
      console.log('Auth initialization complete')
    }).catch((error) => {
      console.error('Error getting session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // For social login, create profile if it doesn't exist
          await loadProfile(
            session.user.id, 
            session.user.email || '', 
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          )
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string, email?: string, fullName?: string) => {
    try {
      console.log('Loading profile for user:', userId, 'email:', email)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 10000)
      )
      
      const profilePromise = authService.getOrCreateProfile(userId, email || '', fullName)
      
      // Race between profile loading and timeout
      const profile = await Promise.race([profilePromise, timeoutPromise]) as any
      
      console.log('Profile loaded successfully:', profile)
      setProfile(profile)
    } catch (error) {
      console.error('Error loading profile:', error)
      // Set profile to null if loading fails, but don't block the UI
      setProfile(null)
      // Still set loading to false so UI can continue
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password, fullName)
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await authService.signIn(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log('Calling authService.signOut()...')
      await authService.signOut()
      console.log('authService.signOut() completed')
      // Clear local state
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (stage: number, score?: number) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const updatedProfile = await authService.updateProgress(user.id, stage, score)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }

  const awardBadge = async (badgeName: string) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const updatedProfile = await authService.awardBadge(user.id, badgeName)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error awarding badge:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    await loadProfile(user.id)
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProgress,
    awardBadge,
    refreshProfile,
  }

  return (
    <LearningAuthContext.Provider value={value}>
      {children}
    </LearningAuthContext.Provider>
  )
}

export function useLearningAuth() {
  const context = useContext(LearningAuthContext)
  if (context === undefined) {
    throw new Error('useLearningAuth must be used within a LearningAuthProvider')
  }
  return context
}