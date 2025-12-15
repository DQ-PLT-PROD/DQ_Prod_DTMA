import "./index.css";
// Force update to resolve Vercel build issue
import { AppRouter } from "./AppRouter";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./services/auth/msal";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://90va0q4bccgp.share.zrok.io/services-api",
    // Avoid ngrok browser warning interstitials from breaking preflight
    headers: { skip_zrok_interstitial: "1" },
    // Ensure CORS mode
    fetchOptions: { mode: "cors" },
  }),
  cache: new InMemoryCache(),
});

async function initializeApp() {
  console.log('🚀 App initialization starting...');
  
  // Check if we're returning from an auth redirect
  const urlParams = new URLSearchParams(window.location.search);
  const urlHash = window.location.hash;
  const isAuthRedirect = urlParams.has('code') || urlParams.has('error') || urlHash.includes('access_token') || urlHash.includes('id_token');
  
  console.log('🔍 URL analysis:', {
    search: window.location.search,
    hash: window.location.hash,
    isAuthRedirect
  });
  
  const container = document.getElementById("root");
  if (!container) {
    console.error('❌ Root container not found!');
    return;
  }

  const root = createRoot(container);

  try {
    console.log('🔐 Initializing MSAL...');
    // Initialize MSAL
    await msalInstance.initialize();
    
    console.log('✅ MSAL initialized successfully');
    
    // Handle redirect response
    console.log('🔄 Handling MSAL redirect promise...');
    const response = await msalInstance.handleRedirectPromise();
    console.log('🔄 MSAL redirect response:', response);
    console.log('🔄 Response type:', typeof response);
    console.log('🔄 Response details:', {
      hasResponse: !!response,
      hasAccount: response?.account ? true : false,
      hasAccessToken: response?.accessToken ? true : false,
      hasIdToken: response?.idToken ? true : false
    });
    
    if (response?.account) {
      console.log('✅ Setting active account from redirect:', response.account);
      console.log('🔍 Account details:', {
        name: response.account.name,
        username: response.account.username,
        idTokenClaims: response.account.idTokenClaims
      });
      
      msalInstance.setActiveAccount(response.account);
      
      // If we have a successful redirect response, ensure we don't redirect again
      if (response.accessToken || response.idToken) {
        console.log('🎉 Authentication successful via redirect!');
        console.log('🔍 ID Token Claims:', response.idTokenClaims);
        console.log('🔍 Access Token present:', !!response.accessToken);
        
        // Clear the URL parameters to prevent confusion
        if (isAuthRedirect) {
          console.log('🧹 Cleaning up auth redirect URL...');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Redirect to learning page after successful authentication (like test account)
        setTimeout(() => {
          console.log('🎓 Redirecting to learning page after successful real authentication...');
          window.location.href = '/learning';
        }, 500);
      }
    } else {
      // Check for existing accounts
      const accounts = msalInstance.getAllAccounts();
      console.log('📊 Existing accounts found:', accounts.length);
      if (accounts.length > 0) {
        console.log('✅ Setting active account from existing:', accounts[0]);
        msalInstance.setActiveAccount(accounts[0]);
      } else {
        console.log('⚠️ No existing accounts found');
      }
    }
    
    // Additional debugging
    console.log('🔍 Final MSAL state:', {
      activeAccount: !!msalInstance.getActiveAccount(),
      totalAccounts: msalInstance.getAllAccounts().length
    });
    
    // Small delay to ensure MSAL state is updated
    setTimeout(() => {
      root.render(
        <ApolloProvider client={client}>
          <MsalProvider instance={msalInstance}>
            <AppRouter />
          </MsalProvider>
        </ApolloProvider>
      );
    }, 100);
  } catch (error) {
    console.error("❌ MSAL initialization failed:", error);
    console.error("Error details:", error.message, error.stack);
    
    // Check if it's a domain/tenant error
    if (error.message && error.message.includes('AADSTS500208')) {
      console.error("🚨 DOMAIN ERROR: The tenant configuration is incorrect.");
      console.error("💡 SOLUTION: This app may need to be registered in a different Azure AD tenant or use a different authority.");
      console.error("🔧 Current tenant ID:", import.meta.env.VITE_AZURE_TENANT_ID);
      console.error("🔧 Current authority: https://login.microsoftonline.com/common");
    }
    
    // Render app anyway with error state
    root.render(
      <ApolloProvider client={client}>
        <MsalProvider instance={msalInstance}>
          <AppRouter />
        </MsalProvider>
      </ApolloProvider>
    );
  }
}

console.log('🎯 Starting app initialization...');
initializeApp();
