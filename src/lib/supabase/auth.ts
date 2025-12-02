import { createClient, Provider } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ugmybskacomcdgdngolz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbXlic2thY29tY2RnZG5nb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTM0MDEsImV4cCI6MjA4MDIyOTQwMX0.iwNLBgOsE1k8Eb3noMhJ4kCZX6b5oLdq-0B5S7CcPpo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface LearnerProfile {
  id: string
  email: string
  full_name?: string
  current_stage: number
  completed_stages: number[]
  total_score: number
  badges: string[]
  created_at: string
  updated_at: string
}

export const authService = {
  // Sign up new learner
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    
    if (error) throw error
    
    // Create learner profile
    if (data.user) {
      await this.createLearnerProfile(data.user.id, email, fullName)
    }
    
    return data
  },

  // Sign in existing learner
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign in with social provider (Google, Facebook, etc.)
  async signInWithProvider(provider: Provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/learning`,
      }
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Create learner profile in database
  async createLearnerProfile(userId: string, email: string, fullName?: string) {
    // Check if profile already exists (for social login)
    const existing = await this.getLearnerProfile(userId)
    if (existing) return existing

    const { data, error } = await supabase
      .from('learner_profiles')
      .insert([
        {
          id: userId,
          email,
          full_name: fullName,
          current_stage: 0,
          completed_stages: [],
          total_score: 0,
          badges: [],
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Create or get profile for social login
  async getOrCreateProfile(userId: string, email: string, fullName?: string) {
    console.log('getOrCreateProfile called for:', userId)
    
    try {
      console.log('Checking if profile exists...')
      let profile = await this.getLearnerProfile(userId)
      
      if (!profile) {
        console.log('Profile not found, creating new profile...')
        profile = await this.createLearnerProfile(userId, email, fullName)
        console.log('Profile created:', profile)
      } else {
        console.log('Profile found:', profile)
      }
      
      return profile
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error)
      throw error
    }
  },

  // Get learner profile
  async getLearnerProfile(userId: string): Promise<LearnerProfile | null> {
    const { data, error } = await supabase
      .from('learner_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  // Update learner progress
  async updateProgress(userId: string, stage: number, score?: number) {
    const profile = await this.getLearnerProfile(userId)
    if (!profile) throw new Error('Learner profile not found')

    const completedStages = [...new Set([...profile.completed_stages, stage])]
    const newScore = score ? profile.total_score + score : profile.total_score
    const nextStage = Math.max(profile.current_stage, stage + 1)

    const { data, error } = await supabase
      .from('learner_profiles')
      .update({
        current_stage: nextStage,
        completed_stages: completedStages,
        total_score: newScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Award badge
  async awardBadge(userId: string, badgeName: string) {
    const profile = await this.getLearnerProfile(userId)
    if (!profile) throw new Error('Learner profile not found')

    const badges = [...new Set([...profile.badges, badgeName])]

    const { data, error } = await supabase
      .from('learner_profiles')
      .update({
        badges,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}