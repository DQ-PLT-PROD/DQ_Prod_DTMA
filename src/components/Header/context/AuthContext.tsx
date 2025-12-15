import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginRequest, interactiveLoginRequest } from '../../../services/auth/msal';
import { mockAuthService, MockUser } from '../../../services/auth/mockAuth';
import { validateAndLogClaims, extractUserProfile } from '../../../utils/claimsValidator';
import { fetchUserFromGraph, mergeGraphUserData } from '../../../services/graphService';
import { logAuthenticationState, validateTokenResponse } from '../../../utils/authTester';

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
  const { instance, accounts, inProgress } = useMsal();
  const [bypassUser, setBypassUser] = useState<UserProfile | null>(null);
  const [mockUser, setMockUser] = useState<UserProfile | null>(null);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  const bypassMode = import.meta.env.VITE_BYPASS_AZURE_AUTH === 'true';
  
  // Debug environment variables
  console.log('🔧 Auth Environment Variables:', {
    VITE_USE_MOCK_AUTH: import.meta.env.VITE_USE_MOCK_AUTH,
    VITE_BYPASS_AZURE_AUTH: import.meta.env.VITE_BYPASS_AZURE_AUTH,
    useMockAuth,
    bypassMode
  });
  
  // Initialize mock auth if enabled
  useEffect(() => {
    if (useMockAuth) {
      const currentMockUser = mockAuthService.getCurrentUser();
      if (currentMockUser) {
        setMockUser({
          id: currentMockUser.id,
          name: currentMockUser.name,
          email: currentMockUser.email
        });
      }

      const unsubscribe = mockAuthService.onAuthStateChanged((user: MockUser | null) => {
        setMockUser(user ? {
          id: user.id,
          name: user.name,
          email: user.email
        } : null);
      });

      return unsubscribe;
    }
  }, [useMockAuth]);
  
  // Fix loading state - should only be loading during actual auth operations
  const isLoading = useMockAuth ? false : (inProgress === 'login' || inProgress === 'ssoSilent' || inProgress === 'acquireToken');

  // Helper function to extract user information from MSAL account
  const extractUserFromAccount = (account: any): UserProfile | null => {
    if (!account) return null;

    console.log('🔍 Extracting user info from account:', account);
    console.log('🔍 Account properties:', {
      localAccountId: account.localAccountId,
      homeAccountId: account.homeAccountId,
      name: account.name,
      username: account.username
    });

    // Validate and process ID token claims
    const idTokenClaims = account.idTokenClaims || {};
    const validatedClaims = validateAndLogClaims(idTokenClaims);
    
    // Extract user profile from validated claims
    const userProfile = extractUserProfile(validatedClaims);
    
    // Fallback to account properties if claims are insufficient
    if (!userProfile.id || userProfile.id === 'unknown-user') {
      userProfile.id = account.localAccountId || account.homeAccountId || 'user-' + Date.now();
    }
    
    if (!userProfile.name || userProfile.name === 'User') {
      userProfile.name = account.name || account.username || 'User';
    }
    
    if (!userProfile.email || userProfile.email === 'user@domain.com') {
      userProfile.email = account.username || 'user@domain.com';
    }

    console.log('✅ Final extracted user info:', userProfile);
    return userProfile;
  };

  // User detection priority: mock auth > bypass mode > real Azure AD
  const user: UserProfile | null = useMockAuth 
    ? mockUser 
    : (bypassMode 
        ? bypassUser 
        : (accounts.length > 0 
            ? extractUserFromAccount(accounts[0]) 
            : null));

  // Debug user detection
  console.log('👤 User Detection Debug:', {
    useMockAuth,
    bypassMode,
    accountsLength: accounts.length,
    mockUser: !!mockUser,
    bypassUser: !!bypassUser,
    bypassUserDetails: bypassUser,
    finalUser: !!user,
    userDetails: user
  });

  // Set active account when we have accounts
  useEffect(() => {
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      console.log('🔄 Setting active account from accounts array:', accounts[0]);
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔍 Auth state changed:', {
      user: !!user,
      userEmail: user?.email,
      isLoading,
      accountsCount: accounts.length,
      inProgress,
      useMockAuth,
      bypassMode
    });
    
    // Log detailed authentication state for debugging
    if (!useMockAuth && !bypassMode) {
      logAuthenticationState(accounts, instance.getActiveAccount());
    }
  }, [user, isLoading, accounts.length, inProgress, useMockAuth, bypassMode, accounts, instance]);

  // Redirect to learning page after successful authentication (like test account)
  useEffect(() => {
    if (user && !isLoading) {
      const currentPath = location.pathname;
      
      // Redirect to learning page just like the test account does
      if (currentPath === '/' || currentPath.includes('auth') || currentPath.includes('signin')) {
        console.log('🎓 Real account authenticated! Redirecting to learning page from:', currentPath);
        navigate('/learning', { replace: true });
      } else if (currentPath === '/learning') {
        console.log('✅ Real account user is already on learning page');
      } else {
        console.log('ℹ️ Real account authenticated on page:', currentPath);
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  const login = async () => {
    console.log('🔐 Login function called with modes:', { useMockAuth, bypassMode });
  console.log('🎯 Using REAL Azure AD authentication (not test account)');
    
    // If mock auth is enabled, use mock authentication
    if (useMockAuth) {
      console.log('🎭 Using mock authentication...');
      try {
        await mockAuthService.login();
        
        // Redirect to learning page after mock login
        setTimeout(() => {
          const currentPath = window.location.pathname;
          if (currentPath !== '/learning') {
            console.log('🎓 Redirecting to learning page after mock login...');
            navigate('/learning', { replace: true });
          }
        }, 100);
      } catch (error) {
        console.error('Mock login error:', error);
      }
      return;
    }
    
    // If bypass mode is enabled, create a mock user and skip Azure entirely
    if (bypassMode) {
      console.log('🚀 Using bypass mode - creating test user...');
      const testUser = {
        id: 'bypass-user-' + Date.now(),
        name: 'Test User',
        email: 'test@example.com'
      };
      
      console.log('👤 Setting bypass user:', testUser);
      setBypassUser(testUser);
      
      // Redirect to learning page after bypass login
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath !== '/learning') {
          console.log('🎓 Redirecting to learning page after bypass login...');
          navigate('/learning', { replace: true });
        }
      }, 100);
      
      return;
    }
    
    // Prevent multiple login attempts (simplified)
    if (loginInProgress) {
      console.log('Login already in progress, skipping...');
      return;
    }
    
    setLoginInProgress(true);
    
    setLoginInProgress(true);
    
    try {
      console.log('🔐 Starting real Azure AD login (like working test account)...');
      
      // Use redirect login for External Identities
      console.log('🔄 Redirecting to Microsoft login...');
      await instance.loginRedirect(interactiveLoginRequest);
      
      // loginRedirect will redirect the page, so execution stops here
      console.log('🔄 Redirect initiated successfully');
    } catch (error) {
      console.error('❌ Login redirect error:', error);
      setLoginInProgress(false);
      
      // Show user-friendly error
      console.error('Login failed. Please try again.');
    }
  };

  const signup = () => {
    instance.loginRedirect(interactiveLoginRequest);
  };

  const logout = () => {
    if (useMockAuth) {
      mockAuthService.logout();
      return;
    }
    if (bypassMode) {
      setBypassUser(null);
      return;
    }
    
    console.log('🚪 Logging out user...');
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });
  };

  // Function to acquire additional user information via Microsoft Graph
  const acquireUserInfo = async (account: any) => {
    try {
      console.log('🔍 Attempting to acquire additional user info...');
      
      const tokenRequest = {
        scopes: ["User.Read"],
        account: account,
      };

      const response = await instance.acquireTokenSilent(tokenRequest);
      console.log('✅ Token acquired successfully:', response);
      
      // Fetch additional user information from Microsoft Graph
      if (response.accessToken) {
        const graphUser = await fetchUserFromGraph(response.accessToken);
        if (graphUser) {
          console.log('✅ Additional user info from Graph API:', graphUser);
          // You could update the user state here if needed
          // For now, we'll just log the enhanced user data
          const currentUser = extractUserFromAccount(account);
          if (currentUser) {
            const enhancedUser = mergeGraphUserData(currentUser, graphUser);
            console.log('🎯 Enhanced user profile:', enhancedUser);
          }
        }
      }
      
      return response;
    } catch (error) {
      console.log('⚠️ Could not acquire additional user info:', error);
      return null;
    }
  };

  // Check for existing authentication on mount and try to get additional user info
  useEffect(() => {
    if (!useMockAuth && !bypassMode) {
      const activeAccount = instance.getActiveAccount();
      if (activeAccount) {
        console.log('🔍 Found active account on mount:', activeAccount);
        
        // Try to acquire additional user information
        acquireUserInfo(activeAccount).then(tokenResponse => {
          if (tokenResponse) {
            console.log('✅ Additional user info acquired');
          }
        });
      } else if (accounts.length > 0) {
        console.log('🔍 Setting active account from accounts array');
        instance.setActiveAccount(accounts[0]);
        acquireUserInfo(accounts[0]);
      }
    }
  }, [useMockAuth, bypassMode, accounts.length, instance]);

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
