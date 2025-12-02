# 🔐 Learning Authentication System

A simple, complete authentication system for your learning platform using Supabase.

## 🎯 What This Does

- **Sign Up/Sign In** - Email/password + Social login (Google, Facebook, GitHub)
- **Progress Tracking** - Automatically save learning progress
- **Badges & Scores** - Award achievements and points
- **Protected Routes** - Restrict Stage 2 content to signed-in users
- **Session Persistence** - Users stay signed in across browser sessions

## 🚀 Quick Start (3 Steps)

### 1. Set Up Database (2 minutes)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Open **SQL Editor**
3. Copy and paste this file: `migrations/create_learner_profiles.sql`
4. Click **Run**

### 2. Enable Authentication (1 minute)

1. In Supabase Dashboard, go to **Authentication → Providers**
2. Enable **Email** provider
3. Click **Save**

**Optional: Enable Social Login** (15 minutes)
- See `SOCIAL_AUTH_QUICKSTART.md` for Google, Facebook, GitHub setup

### 3. Test It (2 minutes)

```bash
npm run dev
```

1. Look for "Sign In" button in navbar (top right)
2. Click it and create an account
3. Visit `/learning` to see your Stage 2 content
4. Click "Complete Lesson" to earn points

**That's it!** ✨

## 📁 What Was Added

```
✅ Authentication UI in navbar
✅ Sign in/sign up modal
✅ Protected learning page (/learning)
✅ Progress tracking system
✅ Database schema & migrations
✅ Complete documentation
```

## 🎮 How to Use

### For Users

1. **Stage 0** - Landing page (public)
2. **Stage 1** - Browse courses (public)
3. **Stage 2** - Learning hub (requires sign in) ← **NEW!**

### For Developers

```tsx
// Check if user is signed in
import { useLearningAuth } from './contexts/LearningAuthContext'

const { user, profile } = useLearningAuth()

// Update progress
await updateProgress(stageNumber, points)

// Award a badge
await awardBadge('Badge Name')

// Protect a route
<LearningProtectedRoute>
  <YourPage />
</LearningProtectedRoute>
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| **QUICK_START_AUTH.md** | Quick reference guide |
| **SOCIAL_AUTH_QUICKSTART.md** | Social login setup (Google, Facebook, GitHub) |
| **SETUP_CHECKLIST.md** | Step-by-step setup checklist |
| **AUTH_IMPLEMENTATION_SUMMARY.md** | Complete implementation details |
| **docs/LEARNING_AUTH_SETUP.md** | Detailed technical documentation |
| **docs/SOCIAL_AUTH_SETUP.md** | Detailed social auth guide |
| **docs/AUTH_FLOW_DIAGRAM.md** | Visual flow diagrams |
| **docs/INTEGRATION_EXAMPLES.md** | 15+ code examples |

## 🔍 Key Features

### Navbar Integration
- Shows "Sign In" button when not authenticated
- Shows user profile dropdown when authenticated
- Displays current stage, score, and badges
- One-click sign out

### Social Authentication
- Google Sign In
- Facebook Sign In
- GitHub Sign In
- Auto profile creation
- One-click authentication

### Learning Page (Stage 2)
- Welcome section with user name
- Progress statistics dashboard
- Interactive learning content
- Automatic progress tracking
- Badge system

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Passwords securely hashed by Supabase
- Session tokens managed automatically

## 🧪 Testing

See `SETUP_CHECKLIST.md` for complete testing guide.

Quick test:
1. Sign up with test account
2. Check navbar shows profile
3. Visit `/learning`
4. Complete a lesson
5. Verify score updates

## 🛠️ Customization

### Add More Stages

```tsx
// Create new page
function Stage3Page() {
  const { updateProgress } = useLearningAuth()
  
  useEffect(() => {
    updateProgress(3) // Mark stage 3 as current
  }, [])
  
  return <div>Stage 3 Content</div>
}

// Add route
<Route path="/stage-3" element={
  <LearningProtectedRoute>
    <Stage3Page />
  </LearningProtectedRoute>
} />
```

### Custom Badges

```tsx
// Award custom badges
await awardBadge('Course Complete')
await awardBadge('Perfect Score')
await awardBadge('Speed Learner')
```

### Track Custom Metrics

Extend the `learner_profiles` table:
```sql
ALTER TABLE learner_profiles 
ADD COLUMN lessons_completed INTEGER DEFAULT 0,
ADD COLUMN streak_days INTEGER DEFAULT 0;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Sign in not working | Enable email provider in Supabase |
| Profile not loading | Run database migration |
| Can't access /learning | Make sure you're signed in |
| Progress not saving | Check RLS policies in Supabase |

See `SETUP_CHECKLIST.md` for detailed troubleshooting.

## 📊 Database Schema

**learner_profiles** table tracks:
- User information (email, name)
- Current stage (0-10)
- Completed stages (array)
- Total score (points)
- Badges earned (array)
- Timestamps

## 🎨 UI Components

- **LearningAuthButton** - Navbar auth button
- **AuthModal** - Sign in/sign up form
- **LearningProtectedRoute** - Route protection
- **SignInPrompt** - Reusable sign-in prompt
- **LearningPage** - Stage 2 learning hub

## 🔗 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page (Stage 0) |
| `/courses` | Public | Browse courses (Stage 1) |
| `/learning` | Protected | Learning hub (Stage 2) |

## 💡 Examples

See `docs/INTEGRATION_EXAMPLES.md` for 15+ copy-paste examples:
- Protect routes
- Track progress
- Award badges
- Show user stats
- Create leaderboards
- And more!

## 🎯 Next Steps

1. ✅ Run database migration
2. ✅ Test sign up/sign in
3. ✅ Verify progress tracking
4. 📝 Add your learning content
5. 🎨 Customize UI to match your brand
6. 🚀 Deploy to production

## 📞 Support

- Check browser console for errors
- Review Supabase dashboard logs
- See troubleshooting section in `SETUP_CHECKLIST.md`
- Review code examples in `docs/INTEGRATION_EXAMPLES.md`

## ✨ Features Ready to Use

✅ Email authentication
✅ User profiles
✅ Progress tracking
✅ Badge system
✅ Protected routes
✅ Session persistence
✅ Navbar integration
✅ Loading states
✅ Error handling
✅ Mobile responsive

---

**Built with:**
- React
- TypeScript
- Supabase
- Tailwind CSS
- React Router

**Ready to go!** Just run the database migration and start testing. 🚀
