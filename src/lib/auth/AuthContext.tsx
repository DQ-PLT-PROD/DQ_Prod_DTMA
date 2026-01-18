import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginRequest, interactiveLoginRequest } from '../../services/auth/msal';
import { mockAuthService, MockUser } from '../../services/auth/mockAuth';
import { validateAndLogClaims, extractUserProfile } from '../../utils/claimsValidator';
import { fetchUserFromGraph, mergeGraphUserData, GraphUser } from './graphService';
import { logAuthenticationState, validateTokenResponse } from '../../utils/authTester';
import { syncUserWithDatabase, getUserByAzureId, updateUserLastLogin, updateUserProfile, DatabaseUser } from './userService';
import { getLearnerProfile } from '../learner/learnerProfileService';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    customerId?: string;
    jobTitle?: string;
    department?: string;
    officeLocation?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    databaseUser: DatabaseUser | null;
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
    const [databaseUser, setDatabaseUser] = useState<DatabaseUser | null>(null);
    const [loginInProgress, setLoginInProgress] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();


    const useMockAuth = (import.meta as any).env.VITE_USE_MOCK_AUTH === 'true';
    const bypassMode = (import.meta as any).env.VITE_BYPASS_AZURE_AUTH === 'true';

    // Debug environment variables
    console.log('🔧 Auth Environment Variables:', {
        VITE_USE_MOCK_AUTH: (import.meta as any).env.VITE_USE_MOCK_AUTH,
        VITE_BYPASS_AZURE_AUTH: (import.meta as any).env.VITE_BYPASS_AZURE_AUTH,
        VITE_AZURE_CLIENT_ID: (import.meta as any).env.VITE_AZURE_CLIENT_ID,
        VITE_AZURE_TENANT_ID: (import.meta as any).env.VITE_AZURE_TENANT_ID,
        VITE_AZURE_SUBDOMAIN: (import.meta as any).env.VITE_AZURE_SUBDOMAIN,
        VITE_AZURE_REDIRECT_URI: (import.meta as any).env.VITE_AZURE_REDIRECT_URI,
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
    const isLoading = useMockAuth
        ? false
        : (
            inProgress === 'startup' ||
            inProgress === 'handleRedirect' ||
            inProgress === 'login' ||
            inProgress === 'ssoSilent' ||
            inProgress === 'acquireToken'
        );

    const fetchGraphUserForAccount = async (account: any): Promise<GraphUser | null> => {
        try {
            const tokenRequest = {
                scopes: ["User.Read"],
                account,
            };

            const response = await instance.acquireTokenSilent(tokenRequest);
            if (!response?.accessToken) {
                console.warn('No access token available for Graph fetch');
                return null;
            }

            return await fetchUserFromGraph(response.accessToken);
        } catch (error) {
            console.warn('Could not fetch user info from Graph:', error);
            return null;
        }
    };

    // Helper function to extract user information from MSAL account and sync with database
    const extractUserFromAccount = async (account: any): Promise<UserProfile | null> => {
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

        // Fetch email from Microsoft Graph API
        try {
            const tokenRequest = {
                scopes: ["User.Read"],
                account,
            };

            const response = await instance.acquireTokenSilent(tokenRequest);
            if (response?.accessToken) {
                const graphUser = await fetchUserFromGraph(response.accessToken);
                const graphEmail = graphUser?.mail || graphUser?.userPrincipalName;
                if (graphEmail) {
                    userProfile.email = graphEmail;
                    console.log('✅ Email fetched from Graph API:', graphEmail);
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not fetch email from Graph API:', error);
        }

        // Fallback to account username if Graph fetch failed
        if (!userProfile.email || userProfile.email === 'user@domain.com') {
            userProfile.email = account.username || 'user@domain.com';
        }

        console.log('✅ Final extracted user info:', userProfile);

        // Sync user with database
        try {
            console.log('🔄 Syncing user with database...');
            console.log('🔧 Supabase config check:', {
                url: !!import.meta.env.VITE_SUPABASE_URL,
                key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
                urlValue: import.meta.env.VITE_SUPABASE_URL?.substring(0, 20) + '...'
            });

            const azureUserId = account.localAccountId || account.homeAccountId;

            // Check if user already exists
            let dbUser = await getUserByAzureId(azureUserId);

            if (!dbUser) {
                // Create new user in database
                console.log('👤 Creating new user in database...');
                dbUser = await syncUserWithDatabase(userProfile, azureUserId, account.idTokenClaims);

                if (dbUser) {
                    console.log('✅ New user created successfully:', {
                        id: dbUser.id,
                        customerId: dbUser.customer_id,
                        email: dbUser.email
                    });
                } else {
                    console.error('❌ Failed to create user in database');
                }
            } else {
                // Update last login
                console.log('🔄 Updating existing user last login...');
                const updateSuccess = await updateUserLastLogin(azureUserId);
                console.log(updateSuccess ? '✅ Last login updated' : '❌ Failed to update last login');
            }

            if (dbUser) {
                setDatabaseUser(dbUser);

                console.log('✅ User synced with database:', {
                    customerId: dbUser.customer_id,
                    azureUserId: azureUserId,
                    lastLogin: dbUser.last_login
                });

                // Enhance user profile with database info
                const enhancedProfile: UserProfile = {
                    ...userProfile,
                    customerId: dbUser.customer_id,
                    jobTitle: dbUser.job_title || (userProfile as any).jobTitle,
                    department: dbUser.department || (userProfile as any).department,
                    officeLocation: dbUser.office_location || (userProfile as any).officeLocation
                };

                return enhancedProfile;
            } else {
                console.error('❌ No database user available after sync attempt');
            }
        } catch (error) {
            console.error('❌ Error syncing user with database:', error);
            console.error('❌ Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            // Continue without database sync - don't block authentication
        }

        return userProfile;
    };

    // State for the current user (will be set asynchronously for real Azure AD)
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    // User detection priority: mock auth > bypass mode > real Azure AD
    const user: UserProfile | null = useMockAuth
        ? mockUser
        : (bypassMode
            ? bypassUser
            : currentUser);

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

    // Set active account and extract user info when we have accounts
    useEffect(() => {
        if (!useMockAuth && !bypassMode && accounts.length > 0) {
            if (!instance.getActiveAccount()) {
                console.log('🔄 Setting active account from accounts array:', accounts[0]);
                instance.setActiveAccount(accounts[0]);
            }

            // Extract user info and sync with database
            extractUserFromAccount(accounts[0]).then(userProfile => {
                if (userProfile) {
                    setCurrentUser(userProfile);
                }
            }).catch(error => {
                console.error('❌ Error extracting user from account:', error);
            });
        }
    }, [accounts, instance, useMockAuth, bypassMode]);

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

    // Redirect flow with onboarding gate:
    // - Default landing after login is /portal
    // - If onboarding is incomplete, redirect to /portal/onboarding first
    const isDatabaseUserLoading = databaseUser === null && user !== null;
    useEffect(() => {
        if (!user || isLoading || isDatabaseUserLoading) {
            return;
        }

        const currentPath = location.pathname;
        const isOnboardingRoute = currentPath.startsWith('/portal/onboarding')
            || currentPath.startsWith('/dashboard/onboarding');
        const isPortalRoute = currentPath === '/portal' || currentPath.startsWith('/portal/');
        const isSigninRoute = currentPath === '/' || currentPath.includes('signin');

        if (currentPath.includes('auth-debug') || isOnboardingRoute) {
            return;
        }

        if (!isPortalRoute && !isSigninRoute) {
            return;
        }

        const azureUserId = databaseUser?.azure_user_id;
        if (!azureUserId) {
            if (isSigninRoute) {
                navigate('/portal/my-courses/in-progress', { replace: true });
            }
            return;
        }

        let isCancelled = false;

        const checkOnboarding = async () => {
            const { profile, error } = await getLearnerProfile(azureUserId);
            if (isCancelled) {
                return;
            }

            if (error) {
                console.warn('Onboarding gate: profile fetch failed, allowing portal access.', error);
                if (isSigninRoute) {
                    navigate('/portal/my-courses/in-progress', { replace: true });
                }
                return;
            }

            const onboardingComplete = Boolean(profile?.onboardingCompleted);
            if (!onboardingComplete) {
                navigate('/portal/onboarding', { replace: true });
                return;
            }

            if (isSigninRoute) {
                navigate('/portal/my-courses/in-progress', { replace: true });
            }
        };

        checkOnboarding();

        return () => {
            isCancelled = true;
        };
    }, [
        user,
        isLoading,
        isDatabaseUserLoading,
        databaseUser?.azure_user_id,
        location.pathname,
        navigate,
    ]);
    // MSAL Event Listener - Listen for login success events to immediately update state
    // This fixes the issue where users need to refresh the page after sign-in
    useEffect(() => {
        if (useMockAuth || bypassMode) return;

        const callbackId = instance.addEventCallback((event: EventMessage) => {
            console.log('🎯 MSAL Event received:', event.eventType);

            if (event.eventType === EventType.LOGIN_SUCCESS) {
                console.log('✅ LOGIN_SUCCESS event detected!');
                const result = event.payload as AuthenticationResult;

                if (result?.account) {
                    console.log('👤 Setting active account from LOGIN_SUCCESS event:', result.account.username);
                    instance.setActiveAccount(result.account);

                    // Immediately extract user info and update state
                    extractUserFromAccount(result.account).then(userProfile => {
                        if (userProfile) {
                            console.log('✅ User state updated from LOGIN_SUCCESS event:', userProfile.email);
                            setCurrentUser(userProfile);
                            setLoginInProgress(false);
                        }
                    }).catch(error => {
                        console.error('❌ Error processing LOGIN_SUCCESS event:', error);
                        setLoginInProgress(false);
                    });
                }
            }

            if (event.eventType === EventType.LOGIN_FAILURE) {
                console.error('❌ LOGIN_FAILURE event:', event.error);
                setLoginInProgress(false);
            }

            if (event.eventType === EventType.LOGOUT_SUCCESS) {
                console.log('👋 LOGOUT_SUCCESS event - clearing user state');
                setCurrentUser(null);
                setDatabaseUser(null);
            }
        });

        console.log('🔔 MSAL event callback registered:', callbackId);

        return () => {
            if (callbackId) {
                console.log('🔕 Removing MSAL event callback:', callbackId);
                instance.removeEventCallback(callbackId);
            }
        };
    }, [instance, useMockAuth, bypassMode]);

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

        // Prevent multiple login attempts
        if (loginInProgress) {
            console.log('⚠️ Login already in progress, skipping...');
            return;
        }

        setLoginInProgress(true);

        try {
            console.log('🔐 Starting real Azure AD login...');
            console.log('🔄 Redirecting to Microsoft Entra login page...');

            // Use redirect login for External Identities
            await instance.loginRedirect(interactiveLoginRequest);

            // loginRedirect will redirect the page, so execution stops here
            console.log('🔄 Redirect initiated successfully');
        } catch (error: any) {
            console.error('❌ Login redirect error:', error);
            console.error('❌ Error details:', {
                name: error?.name,
                message: error?.message,
                errorCode: error?.errorCode,
                errorMessage: error?.errorMessage
            });
            setLoginInProgress(false);

            // Re-throw to allow caller to handle if needed
            throw error;
        }
    };

    const signup = () => {
        instance.loginRedirect(interactiveLoginRequest);
    };

    const logout = () => {
        console.log('🚪 Logout function called with modes:', { useMockAuth, bypassMode });

        if (useMockAuth) {
            console.log('🎭 Using mock logout...');
            mockAuthService.logout();

            // Navigate to home page after logout
            setTimeout(() => {
                console.log('🏠 Redirecting to home page after logout...');
                navigate('/', { replace: true });
            }, 100);
            return;
        }

        if (bypassMode) {
            console.log('🚀 Using bypass logout...');
            setBypassUser(null);

            // Navigate to home page after logout
            setTimeout(() => {
                console.log('🏠 Redirecting to home page after logout...');
                navigate('/', { replace: true });
            }, 100);
            return;
        }

        console.log('🚪 Logging out user with Azure AD...');
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

                    // Update database with enhanced user data
                    const azureUserId = account.localAccountId || account.homeAccountId;
                    if (azureUserId && databaseUser) {
                        try {
                            await syncUserWithDatabase(
                                {
                                    id: azureUserId,
                                    name: graphUser.displayName || databaseUser.name,
                                    email: graphUser.mail || graphUser.userPrincipalName || databaseUser.email,
                                    jobTitle: graphUser.jobTitle,
                                    department: graphUser.department,
                                    officeLocation: graphUser.officeLocation
                                },
                                azureUserId,
                                { ...account.idTokenClaims, ...graphUser }
                            );
                            console.log('✅ Enhanced user data synced to database');
                        } catch (error) {
                            console.error('❌ Error syncing enhanced user data:', error);
                        }
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

                // Extract user info and sync with database first
                extractUserFromAccount(activeAccount).then(userProfile => {
                    if (userProfile) {
                        setCurrentUser(userProfile);

                        // Then try to acquire additional user information
                        acquireUserInfo(activeAccount).then(tokenResponse => {
                            if (tokenResponse) {
                                console.log('✅ Additional user info acquired');
                            }
                        });
                    }
                });
            } else if (accounts.length > 0) {
                console.log('🔍 Setting active account from accounts array');
                instance.setActiveAccount(accounts[0]);

                extractUserFromAccount(accounts[0]).then(userProfile => {
                    if (userProfile) {
                        setCurrentUser(userProfile);
                        acquireUserInfo(accounts[0]);
                    }
                });
            }
        }
    }, [useMockAuth, bypassMode, instance]);

    return (
        <AuthContext.Provider value={{
            user,
            databaseUser,
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
