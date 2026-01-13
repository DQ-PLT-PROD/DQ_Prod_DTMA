import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './components/Header';
import HomePage from './components/HomePage';

export function App() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Debug logging - no automatic redirect from App.tsx
  useEffect(() => {
    console.log('🏠 App.tsx - Auth state:', { user: !!user, isLoading, userEmail: user?.email });

    // Note: Redirect logic is handled in AuthContext, not here
    if (user) {
      console.log('✅ User is authenticated in App.tsx - redirect handled by AuthContext');
    }
  }, [user, isLoading]);

  return <HomePage />;
}