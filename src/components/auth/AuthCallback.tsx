/**
 * Auth Callback Component
 * Handles redirect after authentication (e.g., Azure AD callback)
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { inProgress } = useMsal();

  useEffect(() => {
    // Once MSAL is done handling the redirect, navigate to portal
    if (inProgress === 'none') {
      navigate('/portal/my-courses/in-progress', { replace: true });
    }
  }, [inProgress, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
