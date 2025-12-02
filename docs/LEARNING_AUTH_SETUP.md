# Learning Authentication Setup Guide

This guide explains how to set up the learning authentication system for Stage 2 access.

## Overview

The learning authentication system uses Supabase to:
- Allow users to sign up and sign in
- Track learning progress (stages, scores, badges)
- Enable users to resume their courses
- Map achievements to their accounts

## Architecture

- **Stage 0**: Landing page (public)
- **Stage 1**: Browse content without signing in (public)
- **Stage 2**: Learning hub with progress tracking (requires authentication)

## Setup Instructions

### 1. Supabase Database Setup

Run the migration file to create the required table:

```sql
-- Run this in your Supabase SQL Editor
-- File: migrations/create_learner_profiles.sql
```

Or manually execute:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/create_learner_profiles.sql`
4. Click "Run"

### 2. Environment Variables

Make sure you have these environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The current configuration uses:
- URL: `https://faqystypjlxqvgkhnbyq.supabase.co`
- Anon Key: (already configured in code)

### 3. Enable Email Authentication in Supabase

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable "Email" provider
3. Configure email templates (optional)

## How It Works

### User Flow

1. **Unauthenticated User (Stage 0/1)**:
   - Sees "Sign In" button in navbar
   - Can browse public content
   - Clicking "Sign In" opens authentication modal

2. **Sign Up**:
   - User enters email, password, and full name
   - Account is created in Supabase Auth
   - Profile is automatically created in `learner_profiles` table
   - User starts at Stage 0 with 0 points

3. **Sign In**:
   - User enters email and password
   - Session is created
   - Profile data is loaded
   - User can access Stage 2 content

4. **Authenticated User (Stage 2)**:
   - Navbar shows user profile with progress
   - Can access `/learning` route
   - Progress is automatically tracked
   - Scores and badges are saved

### Components

- **LearningAuthButton**: Shows in navbar, handles sign in/out
- **AuthModal**: Sign in/sign up form
- **LearningProtectedRoute**: Protects Stage 2 routes
- **LearningPage**: Main learning hub (Stage 2)

### Context & Services

- **LearningAuthContext**: Manages auth state and user profile
- **authService**: Handles Supabase operations (sign up, sign in, progress tracking)

## Usage Examples

### Protecting a Route

```tsx
import { LearningProtectedRoute } from './components/LearningProtectedRoute'

<Route 
  path="/learning" 
  element={
    <LearningProtectedRoute>
      <LearningPage />
    </LearningProtectedRoute>
  } 
/>
```

### Using Auth in Components

```tsx
import { useLearningAuth } from './contexts/LearningAuthContext'

function MyComponent() {
  const { user, profile, updateProgress, awardBadge } = useLearningAuth()
  
  // Update progress when user completes a lesson
  const handleComplete = async () => {
    await updateProgress(2, 10) // Stage 2, +10 points
  }
  
  // Award a badge
  const handleAchievement = async () => {
    await awardBadge('First Lesson Complete')
  }
  
  return (
    <div>
      <p>Welcome {profile?.full_name}</p>
      <p>Score: {profile?.total_score}</p>
    </div>
  )
}
```

### Updating Progress

```tsx
// When user completes a stage
await updateProgress(stageNumber, pointsEarned)

// When user earns a badge
await awardBadge('Badge Name')
```

## Database Schema

### learner_profiles Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User ID (references auth.users) |
| email | TEXT | User email |
| full_name | TEXT | User's full name |
| current_stage | INTEGER | Current learning stage (0-10) |
| completed_stages | INTEGER[] | Array of completed stage numbers |
| total_score | INTEGER | Total points earned |
| badges | TEXT[] | Array of badge names |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

## Testing

1. **Sign Up Flow**:
   - Click "Sign In" button in navbar
   - Switch to "Sign Up" tab
   - Enter email, password, and name
   - Submit form
   - Check Supabase dashboard for new user

2. **Sign In Flow**:
   - Click "Sign In" button
   - Enter credentials
   - Verify profile loads correctly

3. **Protected Route**:
   - Try accessing `/learning` without signing in
   - Should see sign-in prompt
   - Sign in and verify access granted

4. **Progress Tracking**:
   - Complete a lesson
   - Check that score updates
   - Verify in Supabase dashboard

## Troubleshooting

### "User not found" error
- Check that the migration ran successfully
- Verify RLS policies are enabled
- Check Supabase logs

### Authentication not working
- Verify environment variables are set
- Check Supabase project URL and anon key
- Ensure email provider is enabled

### Profile not loading
- Check browser console for errors
- Verify user exists in `learner_profiles` table
- Check RLS policies allow user to read their profile

## Next Steps

- Add more learning content to Stage 2
- Implement additional stages (3-10)
- Add certificate generation
- Create leaderboard
- Add social features (share progress)
