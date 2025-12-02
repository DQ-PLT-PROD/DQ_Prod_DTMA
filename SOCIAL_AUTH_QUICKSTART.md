# Social Authentication - Quick Start

## ✅ What's Been Added

**Social Login Options:**
- 🔵 Google Sign In
- 🔵 Facebook Sign In  
- ⚫ GitHub Sign In

**Features:**
- One-click authentication
- Auto profile creation
- Email/password still available
- Seamless integration with existing auth

## 🚀 Setup (15 minutes)

### Step 1: Enable Google (5 min)

1. **Get Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth Client ID
   - Add redirect URI: `https://faqystypjlxqvgkhnbyq.supabase.co/auth/v1/callback`
   - Copy Client ID & Secret

2. **Configure Supabase:**
   - Supabase Dashboard → Authentication → Providers
   - Enable Google
   - Paste Client ID & Secret
   - Save

### Step 2: Enable Facebook (5 min)

1. **Get Credentials:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create app
   - Add redirect URI: `https://faqystypjlxqvgkhnbyq.supabase.co/auth/v1/callback`
   - Copy App ID & Secret

2. **Configure Supabase:**
   - Supabase Dashboard → Authentication → Providers
   - Enable Facebook
   - Paste App ID & Secret
   - Save

### Step 3: Enable GitHub (5 min)

1. **Get Credentials:**
   - Go to [GitHub Settings](https://github.com/settings/developers)
   - Create OAuth App
   - Add callback: `https://faqystypjlxqvgkhnbyq.supabase.co/auth/v1/callback`
   - Copy Client ID & Secret

2. **Configure Supabase:**
   - Supabase Dashboard → Authentication → Providers
   - Enable GitHub
   - Paste Client ID & Secret
   - Save

## 🧪 Test It

```bash
npm run dev
```

1. Click "Sign In" button in navbar
2. See three social login buttons at top
3. Click "Continue with Google"
4. Complete Google login
5. Redirected back to `/learning`
6. Profile auto-created
7. Navbar shows your info

## 📁 Files Modified

```
✓ src/lib/supabase/auth.ts
  → Added signInWithProvider() method
  → Added getOrCreateProfile() for social login

✓ src/contexts/LearningAuthContext.tsx
  → Auto-creates profile on social login
  → Extracts name from provider metadata

✓ src/components/auth/AuthModal.tsx
  → Added Google, Facebook, GitHub buttons
  → Added "Or continue with email" divider
  → Styled social buttons with brand colors
```

## 🎨 What Users See

**Before:**
```
┌─────────────────────┐
│   Sign In Modal     │
├─────────────────────┤
│ Email: _________    │
│ Password: ______    │
│ [Sign In]           │
└─────────────────────┘
```

**After:**
```
┌─────────────────────────────┐
│      Sign In Modal          │
├─────────────────────────────┤
│ [🔵 Continue with Google]   │
│ [🔵 Continue with Facebook] │
│ [⚫ Continue with GitHub]   │
│                             │
│ ─── Or continue with email ─│
│                             │
│ Email: _________            │
│ Password: ______            │
│ [Sign In]                   │
└─────────────────────────────┘
```

## 🔄 User Flow

```
1. User clicks "Continue with Google"
   ↓
2. Popup/redirect to Google login
   ↓
3. User authorizes app
   ↓
4. Redirected back to app
   ↓
5. Profile auto-created (if first time)
   ↓
6. Lands on /learning page
   ↓
7. Ready to learn!
```

## 💡 Key Features

### Auto Profile Creation

When user signs in with social provider:
- ✅ Checks if profile exists
- ✅ Creates profile if needed
- ✅ Uses email from provider
- ✅ Uses name from provider
- ✅ Sets default values (stage 0, score 0)

### Seamless Integration

- Works alongside email/password auth
- Same profile system
- Same progress tracking
- Same badge system
- No code changes needed in your app

### Smart Redirect

After social login:
- Redirects to `/learning` page
- Profile loaded automatically
- Navbar shows user info
- Ready to start learning

## 🔧 Customization

### Change Redirect URL

Edit `src/lib/supabase/auth.ts`:

```tsx
async signInWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/your-page`, // Change here
    }
  })
}
```

### Add More Providers

Add to `AuthModal.tsx`:

```tsx
<button onClick={() => handleSocialLogin('twitter')}>
  Continue with Twitter
</button>
```

Then enable in Supabase Dashboard.

### Customize Button Styles

Edit button classes in `AuthModal.tsx`:

```tsx
className="w-full flex items-center justify-center gap-3 px-4 py-3 
  bg-blue-600 text-white rounded-md hover:bg-blue-700"
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid redirect URI" | Check callback URL matches exactly |
| Social button doesn't work | Enable provider in Supabase |
| Profile not created | Check browser console for errors |
| Wrong redirect | Verify redirectTo URL |

## 📊 What Gets Stored

When user signs in with Google:

```json
{
  "id": "uuid-from-supabase",
  "email": "user@gmail.com",
  "full_name": "John Doe",
  "current_stage": 0,
  "completed_stages": [],
  "total_score": 0,
  "badges": [],
  "created_at": "2024-12-02T...",
  "updated_at": "2024-12-02T..."
}
```

## 🎯 Benefits

**For Users:**
- ✅ Faster sign-up (one click)
- ✅ No password to remember
- ✅ Trusted authentication
- ✅ Auto-fill profile info

**For You:**
- ✅ Higher conversion rates
- ✅ Less password resets
- ✅ Better user data
- ✅ Professional appearance

## 📚 Documentation

- **Detailed Setup**: `docs/SOCIAL_AUTH_SETUP.md`
- **Main Auth Guide**: `README_AUTH.md`
- **Setup Checklist**: `SETUP_CHECKLIST.md`

## ✨ Ready to Use!

Social authentication is fully implemented. Just:
1. Enable providers in Supabase (15 min)
2. Test each provider
3. Deploy to production

Users can now sign in with their favorite social accounts! 🎉

---

**Quick Links:**
- [Google Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
- [GitHub Settings](https://github.com/settings/developers)
- [Supabase Dashboard](https://app.supabase.com/)
