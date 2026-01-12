/**
 * Test page to demonstrate Entra Auth integration with database sync
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfileDisplay } from '../../../components/UserProfile/UserProfileDisplay';

export function AuthTestPage() {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Entra Auth Integration Test
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page demonstrates the complete integration of Azure AD (Entra) authentication
              with database customer ID synchronization.
            </p>

            {!user ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Authentication Required
                </h2>
                <p className="text-blue-700 mb-4">
                  Please log in with your Microsoft account to test the integration.
                </p>
                <button
                  onClick={login}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Logging in...' : 'Login with Microsoft'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div>
                    <h2 className="text-lg font-semibold text-green-900">
                      ✅ Authentication Successful
                    </h2>
                    <p className="text-green-700">
                      Welcome, {user.name}! Your account is connected and synced.
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>

                <UserProfileDisplay />
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Integration Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔐 Azure AD Authentication</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• MSAL.js integration</li>
                  <li>• External Identities (CIAM)</li>
                  <li>• Token validation</li>
                  <li>• Automatic redirects</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🗄️ Database Synchronization</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Automatic user creation</li>
                  <li>• Customer ID generation</li>
                  <li>• Profile data sync</li>
                  <li>• Session tracking</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">💼 Business Profiles</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Profile linking</li>
                  <li>• Multiple profiles per user</li>
                  <li>• Primary profile designation</li>
                  <li>• Data isolation</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">🔒 Security Features</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Row Level Security (RLS)</li>
                  <li>• User data isolation</li>
                  <li>• Token validation</li>
                  <li>• Secure API calls</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Implementation Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>Azure AD External Identities (CIAM) configuration</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>MSAL.js authentication flow</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>Database user synchronization service</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>Customer ID generation and mapping</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>Business profile linking service</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>React hooks for easy integration</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>Database schema with RLS policies</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>TypeScript type safety</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthTestPage;
