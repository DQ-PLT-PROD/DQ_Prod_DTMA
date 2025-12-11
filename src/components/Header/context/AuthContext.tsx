import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../../services/auth/msal';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: () => void;
  signup: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('🔐 AuthProvider rendering...');
  const { instance, accounts, inProgress } = useMsal();
  console.log('📊 MSAL state:', { accountsCount: accounts.length, inProgress });

  // Simple user detection - just check if we have accounts
  const user: UserProfile | null = accounts.length > 0 ? {
    id: accounts[0].localAccountId,
    name: accounts[0].name || accounts[0].username || 'User',
    email: accounts[0].username || '',
  } : null;

  // Set active account when we have accounts
  useEffect(() => {
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  // Debug logging
  console.log('AuthProvider - accounts:', accounts.length, 'user:', !!user, 'inProgress:', inProgress);
  if (accounts.length > 0) {
    console.log('Account details:', accounts[0]);
  }

  const login = async () => {
    console.log('🔐 Login function called!');
    console.log('Current inProgress state:', inProgress);
    console.log('Current accounts:', accounts.length);
    
    // Prevent multiple login attempts
    if (inProgress !== 'none') {
      console.log('❌ Login already in progress, skipping...');
      return;
    }
    
    try {
      console.log('🧹 Clearing cache before login...');
      await instance.clearCache();
      
      console.log('🚀 Starting loginRedirect with request:', loginRequest);
      console.log('Redirect URI:', import.meta.env.VITE_AZURE_REDIRECT_URI);
      await instance.loginRedirect(loginRequest);
      
      console.log('✅ loginRedirect called successfully');
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.message, error.stack);
      
      // If there's an interaction error, try to clear cache and retry
      if (error.message?.includes('interaction_in_progress')) {
        console.log('🔄 Clearing cache and retrying...');
        await instance.clearCache();
        setTimeout(() => {
          console.log('🔄 Retrying loginRedirect...');
          instance.loginRedirect(loginRequest);
        }, 1000);
      }
    }
  };

  const signup = () => {
    instance.loginRedirect(loginRequest);
  };

  const logout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });
  };

  const isLoading = inProgress !== 'none';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
