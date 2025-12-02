# Quick Start: Learning Authentication

## What's Been Set Up

✅ **Supabase Authentication** - Sign up/sign in system
✅ **Learning Progress Tracking** - Stages, scores, and badges
✅ **Protected Routes** - Stage 2 requires authentication
✅ **Navbar Integration** - Auth button in header
✅ **User Profile Display** - Shows progress in navbar

## How to Use

### 1. Set Up Database (One-time)

Go to your Supabase dashboard and run the SQL migration:

```bash
# File location: migrations/create_learner_profiles.sql
```

Copy the SQL and run it in: **Supabase Dashboard → SQL Editor → New Query**

### 2. Test the Flow

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Sign Up**:
   - Look at the navbar (top right)
   - Click "Sign In" button
   - Switch to "Sign Up" tab
   - Enter: email, password (min 6 chars), full name
   - Click "Create Account"

3. **Access Stage 2**:
   - After signing in, you'll see your profile in navbar
   - Navigate to: `http://localhost:5173/learning`
   - This is your Stage 2 learning page

4. **Test Progress Tracking**:
   - Click "Complete Lesson" button → Earn 10 points
   - Click "Claim Badge" button → Earn a badge
   - Watch your score update in the navbar

### 3. Routes

- `/` - Stage 0: Landing page (public)
- `/courses` - Stage 1: Browse courses (public)
- `/learning` - Stage 2: Learning hub (protected, requires sign in)

### 4. Key Features

**For Users**:
- Sign up with email/password
- Sign in to resume learning
- Track progress (stages, scores, badges)
- View profile in navbar dropdown

**For You (Developer)**:
- Simple Supabase integration
- Automatic profile creation on signup
- Progress tracking functions ready to use
- Protected routes for authenticated content

## Code Examples

### Update Progress When User Completes Something

```tsx
import { useLearningAuth } from './contexts/LearningAuthContext'

function YourComponent() {
  const { updateProgress } = useLearningAuth()
  
  const handleComplete = async () => {
    // Stage number, points to award
    await updateProgress(2, 10)
  }
}
```

### Award a Badge

```tsx
const { awardBadge } = useLearningAuth()

await awardBadge('Course Complete')
```

### Check if User is Signed In

```tsx
const { user, profile } = useLearningAuth()

if (user) {
  console.log('User email:', user.email)
  console.log('Current stage:', profile?.current_stage)
  console.log('Total score:', profile?.total_score)
}
```

### Protect Any Route

```tsx
import { LearningProtectedRoute } from './components/LearningProtectedRoute'

<Route 
  path="/your-protected-page" 
  element={
    <LearningProtectedRoute>
      <YourPage />
    </LearningProtectedRoute>
  } 
/>
```

## What Happens Behind the Scenes

1. **Sign Up**:
   - Creates user in Supabase Auth
   - Automatically creates profile in `learner_profiles` table
   - Sets initial values: stage 0, score 0, no badges

2. **Sign In**:
   - Authenticates with Supabase
   - Loads user profile from database
   - Makes profile available throughout app

3. **Progress Updates**:
   - Saves to Supabase database
   - Updates local state immediately
   - Persists across sessions

## Environment Variables

Already configured in `src/lib/supabase/auth.ts`:
- Supabase URL: `https://faqystypjlxqvgkhnbyq.supabase.co`
- Anon Key: (included in code)

To use your own Supabase project, create `.env`:

```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

## Troubleshooting

**"Sign in not working"**
- Check Supabase dashboard → Authentication → Providers
- Make sure "Email" provider is enabled

**"Can't access /learning page"**
- Make sure you're signed in
- Check browser console for errors

**"Profile not loading"**
- Run the SQL migration in Supabase
- Check Supabase dashboard → Table Editor → learner_profiles

## Next Steps

- Customize the learning page content
- Add more stages (3-10)
- Integrate with your existing course content
- Add more badges and achievements
- Create a leaderboard

For detailed documentation, see: `docs/LEARNING_AUTH_SETUP.md`
