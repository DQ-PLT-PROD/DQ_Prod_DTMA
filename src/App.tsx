import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './components/Header';
import HomePage from './components/HomePage';

export function App() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Debug logging - no automatic redirect
  useEffect(() => {
    console.log('App.tsx - Auth state:', { user: !!user, isLoading });
  }, [user, isLoading]);

  return <HomePage />;
}