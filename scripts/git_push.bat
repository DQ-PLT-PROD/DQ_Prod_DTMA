@echo off
set GIT_PAGER=
git add .
git commit -m "feat: Complete Entra Auth integration with database customer ID sync

- Implemented Azure AD CIAM authentication with MSAL.js
- Added automatic user synchronization with database
- Created customer ID generation and mapping system
- Built business profile linking service
- Added React hooks for easy integration
- Created comprehensive database schema with RLS
- Added TypeScript type safety throughout
- Created test components and documentation
- Fixed all TypeScript issues and error handling

Features:
- User Service: Database sync, customer ID generation
- Business Profile Service: Profile linking to users
- Enhanced AuthContext: Integrated auth + database sync
- UserSync Hook: Easy React integration
- Database Schema: Users, profiles, sessions with RLS
- Security: Row Level Security, data isolation
- Documentation: Complete integration guide"

git push origin feature/profile

echo "Switching to main branch..."
git checkout main
git merge feature/profile
git push origin main

echo "Switching to develop branch..."
git checkout develop
git merge feature/profile
git push origin develop

echo "Switching to develop-staging branch..."
git checkout develop-staging
git merge feature/profile
git push origin develop-staging

echo "Returning to feature/profile branch..."
git checkout feature/profile

echo "All branches updated successfully!"