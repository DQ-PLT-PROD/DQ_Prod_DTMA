/**
 * Environment Debug Component
 * Use this to verify environment variables are loaded in production
 * Remove after debugging
 */
import React from 'react';

export const EnvDebug: React.FC = () => {
  const envVars = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseServiceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    azureClientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    azureTenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    azureSubdomain: import.meta.env.VITE_AZURE_SUBDOMAIN,
  };

  // Only show in development or when explicitly enabled
  if (import.meta.env.PROD && !import.meta.env.VITE_SHOW_DEBUG) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔧 Environment Debug</h3>
      <div className="space-y-1">
        <div>Supabase URL: {envVars.supabaseUrl ? '✅ Set' : '❌ Missing'}</div>
        <div>Supabase Anon: {envVars.supabaseAnonKey ? '✅ Set' : '❌ Missing'}</div>
        <div>Supabase Service: {envVars.supabaseServiceKey ? '✅ Set' : '❌ Missing'}</div>
        <div>Azure Client: {envVars.azureClientId ? '✅ Set' : '❌ Missing'}</div>
        <div>Azure Tenant: {envVars.azureTenantId ? '✅ Set' : '❌ Missing'}</div>
        <div>Azure Subdomain: {envVars.azureSubdomain ? '✅ Set' : '❌ Missing'}</div>
      </div>
      <div className="mt-2 text-xs opacity-75">
        Mode: {import.meta.env.MODE} | Prod: {import.meta.env.PROD ? 'Yes' : 'No'}
      </div>
    </div>
  );
};