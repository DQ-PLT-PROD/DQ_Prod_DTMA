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

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  // Ensure MSAL is initialized and redirect response handled before using any APIs
  msalInstance
    .initialize()
    .then(() => msalInstance.handleRedirectPromise())
    .then((result) => {
      if (result?.account) {
        msalInstance.setActiveAccount(result.account);
      } else {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 1) {
          msalInstance.setActiveAccount(accounts[0]);
        }
      }
      // Handle post-authentication redirects
      try {
        // Check if user just completed authentication
        const hasAuthResult = result?.account;
        
        // If user just completed authentication, set a flag and let AuthContext handle the redirect
        if (hasAuthResult) {
          console.log('Authentication completed, setting redirect flag');
          sessionStorage.setItem('shouldRedirectToLearning', 'true');
        }
      } catch (e) {
        console.error('Redirect logic error:', e);
      }
      root.render(
        <ApolloProvider client={client}>
          <MsalProvider instance={msalInstance}>
            <AppRouter />
          </MsalProvider>
        </ApolloProvider>
      );
    })
    .catch((e) => {
      console.error("MSAL initialization failed:", e);
      root.render(
        <div style={{
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>Application Initialization Failed</h1>
          <p style={{ color: '#374151', marginBottom: '24px', lineHeight: '1.5' }}>
            The authentication service could not be initialized. This is likely due to missing or incorrect environment variables.
          </p>
          <div style={{
            background: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'left',
            overflowX: 'auto',
            marginBottom: '24px'
          }}>
            <code style={{ fontSize: '14px', color: '#dc2626' }}>{e.toString()}</code>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Please check your <code>.env</code> file and ensure <code>VITE_AZURE_CLIENT_ID</code>, <code>VITE_B2C_TENANT_NAME</code>, and other required variables are set correctly.
          </p>
        </div>
      );
    });
}
