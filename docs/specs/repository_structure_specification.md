# DTMA Repository Structure

> **Quick Reference** for developers and AI agents navigating this codebase.

## Tech Stack
**React 19** + **TypeScript** + **Vite** + **Tailwind CSS** + **Supabase** + **Azure AD**

---

## Why Feature-Based Architecture?

We adopted the **Feature-Based Folder Structure** inspired by [Web Dev Simplified](https://www.youtube.com/watch?v=xyxrB2Aa7KE).

### The Problem with Traditional Structures
```
❌ Layer-Based (Anti-Pattern)
src/
├── components/     # 50+ files, hard to find what you need
├── services/       # Everything dumped here
├── pages/          # Disconnected from related logic
└── utils/          # Catch-all junk drawer
```
- Files related to one feature scattered across folders
- Adding a feature = editing 5+ folders
- Deleting a feature = hunting across the entire codebase

### The Solution: Feature-Based
```
✅ Feature-Based (Our Approach)
src/features/
├── auth/           # Everything auth lives here
├── courses/        # Everything courses lives here
└── learning/       # Everything learning lives here
```
- **Colocation**: Related files live together
- **Scalability**: Add/remove features without touching unrelated code
- **Clarity**: Find what you need by asking "what feature is this?"

---

## Root Directory
```
DQ_Prod_DTMA/
├── src/              # Application source code
├── public/           # Static assets (images, logos)
├── supabase/         # Database migrations
├── docs/             # Documentation
├── DTMA Specs/       # Formal specifications
├── k8s/              # Kubernetes configs
└── [config files]    # vite, tailwind, tsconfig, etc.
```

---

## Source Code (`src/`)
```
src/
├── features/         # ⭐ CORE: Feature-based modules
│   ├── auth/         # Authentication (login, context, protected routes)
│   ├── courses/      # Course catalog, details, assessment
│   ├── dashboard/    # User profile and settings
│   ├── landing/      # Marketing landing page
│   ├── learning/     # Video player, progress tracking
│   └── app/          # App-level pages (NotFound, ComingSoon)
│
├── components/       # Shared UI (Header, Footer, Modals)
├── lib/              # External integrations (Supabase, MSAL)
├── hooks/            # Shared React hooks
├── types/            # TypeScript definitions
├── utils/            # Helper functions
│
├── App.tsx           # Root component
├── AppRouter.tsx     # Route definitions
└── index.tsx         # Entry point
```

---

## Feature Module Structure
Each feature in `src/features/` follows this pattern:
```
features/<name>/
├── components/       # UI components
├── services/         # API calls & business logic
├── pages/            # Routed page components
└── context/          # React Context (if needed)
```

---

## Key Entry Points
| File | Purpose |
|------|---------|
| `src/index.tsx` | App bootstrap |
| `src/AppRouter.tsx` | All routes defined here |
| `src/features/auth/context/AuthContext.tsx` | Auth state provider |
| `src/lib/supabase/client.ts` | Database connection |

---

## Reference
📺 [This Folder Structure Makes Me 100% More Productive](https://www.youtube.com/watch?v=xyxrB2Aa7KE) - Web Dev Simplified

---

*Find what you need, build what matters.* 🚀
