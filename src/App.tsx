import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './components/Header';
import HomePage from './components/HomePage';

export function App() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to learning page
  useEffect(() => {
    if (!isLoading && user) {
      console.log('User is authenticated, redirecting to learning page');
      navigate('/learning', { replace: true });
    } else if (!isLoading && !user) {
      // Check if we should redirect after authentication
      const shouldRedirect = sessionStorage.getItem('shouldRedirectToLearning');
      if (shouldRedirect) {
        sessionStorage.removeItem('shouldRedirectToLearning');
        // Wait a bit for auth state to update, then check again
        setTimeout(() => {
          if (user) {
            navigate('/learning', { replace: true });
          }
        }, 1000);
      }
    }
  }, [user, isLoading, navigate]);

  return <HomePage />;
}