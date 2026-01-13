/**
 * Supabase Connection Test Component
 * Use this to verify database connectivity in production
 */
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export const SupabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      const results: any = {};
      
      try {
        // Test 1: Basic connection
        const { data, error } = await supabase.from('courses').select('count').limit(1);
        results.connection = error ? `❌ ${error.message}` : '✅ Connected';
        
        // Test 2: Check if user_enrollments table exists
        const { data: enrollData, error: enrollError } = await supabase
          .from('user_enrollments')
          .select('count')
          .limit(1);
        results.enrollments = enrollError ? `❌ ${enrollError.message}` : '✅ Table exists';
        
        // Test 3: Check environment
        results.url = supabase.supabaseUrl ? '✅ URL set' : '❌ No URL';
        results.key = supabase.supabaseKey ? '✅ Key set' : '❌ No key';
        
      } catch (err) {
        results.error = `❌ ${err}`;
      }
      
      setTestResults(results);
    };

    testConnection();
  }, []);

  // Only show in development or when debug enabled
  if (import.meta.env.PROD && !import.meta.env.VITE_SHOW_DEBUG) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 bg-blue-900 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔧 Supabase Test</h3>
      <div className="space-y-1">
        {Object.entries(testResults).map(([key, value]) => (
          <div key={key}>{key}: {String(value)}</div>
        ))}
      </div>
    </div>
  );
};