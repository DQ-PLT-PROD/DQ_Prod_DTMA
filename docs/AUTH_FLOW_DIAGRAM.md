# Authentication Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Stage 0     │  Landing Page (/)
│  Public      │  - Hero section
└──────┬───────┘  - Browse features
       │          - See "Sign In" button
       │
       ▼
┌──────────────┐
│  Stage 1     │  Browse Content (/courses, /marketplace)
│  Public      │  - View courses
└──────┬───────┘  - Explore marketplace
       │          - Still see "Sign In" button
       │
       │  ┌─────────────────────────────────────┐
       │  │  User clicks "Sign In" button       │
       │  └─────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                    AUTH MODAL OPENS                       │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────┐              ┌─────────────┐           │
│  │  Sign In    │              │  Sign Up    │           │
│  ├─────────────┤              ├─────────────┤           │
│  │ • Email     │              │ • Full Name │           │
│  │ • Password  │              │ • Email     │           │
│  │             │              │ • Password  │           │
│  │ [Sign In]   │              │ [Sign Up]   │           │
│  └─────────────┘              └─────────────┘           │
└──────────────────────────────────────────────────────────┘
       │                                │
       │ Existing User                  │ New User
       ▼                                ▼
┌──────────────┐              ┌──────────────────────┐
│ Authenticate │              │ Create Account       │
│ with         │              │ 1. Supabase Auth     │
│ Supabase     │              │ 2. Create Profile    │
└──────┬───────┘              │    - Stage: 0        │
       │                      │    - Score: 0        │
       │                      │    - Badges: []      │
       │                      └──────────┬───────────┘
       │                                 │
       └─────────────┬───────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  AUTHENTICATED STATE  │
         └───────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│              NAVBAR UPDATES                            │
├────────────────────────────────────────────────────────┤
│  Before: [Sign In] button                              │
│  After:  [Profile Dropdown]                            │
│          • User name                                   │
│          • Current stage                               │
│          • Total score                                 │
│          • Badges count                                │
│          • Sign Out option                             │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────┐
│  Stage 2     │  Learning Hub (/learning)
│  Protected   │  - Access granted ✓
└──────┬───────┘  - Progress tracked
       │          - Scores saved
       │          - Badges awarded
       │
       ▼
┌────────────────────────────────────────────────────────┐
│              LEARNING ACTIVITIES                       │
├────────────────────────────────────────────────────────┤
│  Complete Lesson → updateProgress(2, 10)               │
│                    ↓                                   │
│                    Score: +10 points                   │
│                    Stage: 2 marked complete            │
│                    ↓                                   │
│                    Saved to Supabase                   │
│                    ↓                                   │
│                    Navbar updates instantly            │
│                                                        │
│  Earn Achievement → awardBadge('Badge Name')           │
│                     ↓                                  │
│                     Badge added to profile             │
│                     ↓                                  │
│                     Saved to Supabase                  │
│                     ↓                                  │
│                     Badge count updates                │
└────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AppRouter.tsx                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │         LearningAuthProvider (Context)            │ │
│  │  • Manages auth state                             │ │
│  │  • Provides user & profile                        │ │
│  │  • Handles sign in/out                            │ │
│  │  • Updates progress                               │ │
│  └───────────────────────────────────────────────────┘ │
│                          │                              │
│         ┌────────────────┼────────────────┐            │
│         ▼                ▼                ▼            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│  │  Header  │    │  Routes  │    │  Footer  │        │
│  └──────────┘    └──────────┘    └──────────┘        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Header Component                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │         LearningAuthButton                        │ │
│  │  • Shows "Sign In" if not authenticated           │ │
│  │  • Shows profile dropdown if authenticated        │ │
│  │  • Displays progress stats                        │ │
│  └───────────────────────────────────────────────────┘ │
│                          │                              │
│                          ▼                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │              AuthModal                            │ │
│  │  • Sign in form                                   │ │
│  │  • Sign up form                                   │ │
│  │  • Form validation                                │ │
│  │  • Error handling                                 │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Route Protection                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │      LearningProtectedRoute                       │ │
│  │  • Checks if user is authenticated                │ │
│  │  • Shows sign-in prompt if not                    │ │
│  │  • Renders children if authenticated              │ │
│  └───────────────────────────────────────────────────┘ │
│                          │                              │
│                          ▼                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │           LearningPage (Stage 2)                  │ │
│  │  • Welcome section                                │ │
│  │  • Progress stats                                 │ │
│  │  • Learning content                               │ │
│  │  • Interactive activities                         │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Backend                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │   auth.users     │      │ learner_profiles │       │
│  ├──────────────────┤      ├──────────────────┤       │
│  │ • id (UUID)      │◄─────┤ • id (FK)        │       │
│  │ • email          │      │ • email          │       │
│  │ • password_hash  │      │ • full_name      │       │
│  │ • created_at     │      │ • current_stage  │       │
│  └──────────────────┘      │ • completed[]    │       │
│                            │ • total_score    │       │
│                            │ • badges[]       │       │
│                            │ • created_at     │       │
│                            │ • updated_at     │       │
│                            └──────────────────┘       │
│                                                         │
│  Row Level Security (RLS):                             │
│  • Users can only read/write their own data            │
│  • Automatic enforcement                               │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
                          │ Supabase Client
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  authService (lib/supabase/auth.ts)                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │ • signUp(email, password, name)                   │ │
│  │ • signIn(email, password)                         │ │
│  │ • signOut()                                       │ │
│  │ • getLearnerProfile(userId)                       │ │
│  │ • updateProgress(userId, stage, score)            │ │
│  │ • awardBadge(userId, badgeName)                   │ │
│  └───────────────────────────────────────────────────┘ │
│                          ▲                              │
│                          │                              │
│                          │                              │
│  LearningAuthContext                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ State:                                            │ │
│  │ • user: User | null                               │ │
│  │ • profile: LearnerProfile | null                  │ │
│  │ • session: Session | null                         │ │
│  │ • loading: boolean                                │ │
│  │                                                   │ │
│  │ Methods:                                          │ │
│  │ • signUp()                                        │ │
│  │ • signIn()                                        │ │
│  │ • signOut()                                       │ │
│  │ • updateProgress()                                │ │
│  │ • awardBadge()                                    │ │
│  └───────────────────────────────────────────────────┘ │
│                          ▲                              │
│                          │                              │
│                          │ useLearningAuth()            │
│                          │                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │           Any Component                           │ │
│  │  const { user, profile, updateProgress } =        │ │
│  │    useLearningAuth()                              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## State Management Flow

```
User Action → Component → Context → Service → Supabase
                  ▲                              │
                  │                              │
                  └──────── Update ◄─────────────┘

Example: Complete Lesson

1. User clicks "Complete Lesson" button
   ↓
2. Component calls: updateProgress(2, 10)
   ↓
3. Context receives call
   ↓
4. Context calls: authService.updateProgress(userId, 2, 10)
   ↓
5. Service updates Supabase database
   ↓
6. Service returns updated profile
   ↓
7. Context updates local state
   ↓
8. All components re-render with new data
   ↓
9. Navbar shows updated score
```

## Session Persistence

```
┌─────────────────────────────────────────────────────────┐
│                  Browser Session                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User signs in                                          │
│       ↓                                                 │
│  Supabase creates session token                         │
│       ↓                                                 │
│  Token stored in localStorage                           │
│       ↓                                                 │
│  User closes browser                                    │
│       ↓                                                 │
│  User returns later                                     │
│       ↓                                                 │
│  App checks localStorage                                │
│       ↓                                                 │
│  Session token found                                    │
│       ↓                                                 │
│  Auto-authenticate user                                 │
│       ↓                                                 │
│  Load profile from database                             │
│       ↓                                                 │
│  User continues where they left off ✓                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────┐
│                  Error Scenarios                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Sign Up Errors:                                        │
│  • Email already exists → Show error message            │
│  • Weak password → Show validation error                │
│  • Network error → Show retry option                    │
│                                                         │
│  Sign In Errors:                                        │
│  • Invalid credentials → Show error message             │
│  • Account not found → Suggest sign up                  │
│  • Network error → Show retry option                    │
│                                                         │
│  Protected Route:                                       │
│  • Not authenticated → Show sign-in prompt              │
│  • Session expired → Redirect to sign in                │
│                                                         │
│  Progress Update:                                       │
│  • Network error → Retry automatically                  │
│  • Database error → Show error, keep local state        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
