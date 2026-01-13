/**
 * Test page to verify environment variables
 */
import React, { useEffect, useState } from 'react';
import { isServiceRoleConfigured, getServiceSupabase } from '../lib/supabase/serviceClient';
import { testServiceRoleKey } from '../utils/testServiceRole';

export const TestEnvPage: React.FC = () => {
    const [envStatus, setEnvStatus] = useState<any>({});
    const [testResult, setTestResult] = useState<string>('');
    const [apiTestResult, setApiTestResult] = useState<string>('');

    useEffect(() => {
        const checkEnv = () => {
            const status = {
                url: import.meta.env.VITE_SUPABASE_URL,
                anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
                serviceConfigured: isServiceRoleConfigured()
            };
            setEnvStatus(status);
        };

        checkEnv();
    }, []);

    const testServiceRole = async () => {
        try {
            setTestResult('Testing service role...');
            const client = getServiceSupabase();
            
            // Try a simple query
            const { data, error } = await client
                .from('user_enrollments')
                .select('count')
                .limit(1);
                
            if (error) {
                setTestResult(`Error: ${error.message}`);
            } else {
                setTestResult('✅ Service role working!');
            }
        } catch (err) {
            setTestResult(`Exception: ${err}`);
        }
    };

    const testDirectAPI = async () => {
        setApiTestResult('Testing direct API...');
        const result = await testServiceRoleKey();
        setApiTestResult(result.success ? '✅ Direct API working!' : `❌ ${result.error}`);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">Environment Status</h2>
                <div className="space-y-2 font-mono text-sm">
                    <div>URL: {envStatus.url ? '✅ Found' : '❌ Missing'}</div>
                    <div>Anon Key: {envStatus.anonKey ? '✅ Found' : '❌ Missing'}</div>
                    <div>Service Key: {envStatus.serviceKey ? '✅ Found' : '❌ Missing'}</div>
                    <div>Service Configured: {envStatus.serviceConfigured ? '✅ Yes' : '❌ No'}</div>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">Service Role Test</h2>
                <div className="space-x-4">
                    <button 
                        onClick={testServiceRole}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Test Service Role (Supabase Client)
                    </button>
                    <button 
                        onClick={testDirectAPI}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Test Direct API
                    </button>
                </div>
                {testResult && (
                    <div className="mt-4 p-3 bg-white rounded border">
                        <strong>Supabase Client:</strong> {testResult}
                    </div>
                )}
                {apiTestResult && (
                    <div className="mt-4 p-3 bg-white rounded border">
                        <strong>Direct API:</strong> {apiTestResult}
                    </div>
                )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify(envStatus, null, 2)}
                </pre>
            </div>
        </div>
    );
};