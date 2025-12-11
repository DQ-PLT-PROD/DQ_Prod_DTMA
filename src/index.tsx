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
    const response = await msalInstance.handleRedirectPromise();
    console.log('🔄 MSAL redirect response:', response);
    
    if (response?.account) {
      console.log('Setting active account from redirect:', response.account);
      msalInstance.setActiveAccount(response.account);
    } else {
      // Check for existing accounts
      const accounts = msalInstance.getAllAccounts();
      console.log('Existing accounts:', accounts);
      if (accounts.length > 0) {
        console.log('Setting active account from existing:', accounts[0]);
        msalInstance.setActiveAccount(accounts[0]);
      }
    }
    
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
    // Render app anyway
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
