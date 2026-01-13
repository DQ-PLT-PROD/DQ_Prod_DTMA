/**
 * Test utility to verify service role key is working
 */

export const testServiceRoleKey = async () => {
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    console.log('🧪 Testing Service Role Key...');
    console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Key:', serviceRoleKey ? 'Found' : 'Missing');
    
    if (!serviceRoleKey || !supabaseUrl) {
        console.error('❌ Missing environment variables');
        return { success: false, error: 'Missing environment variables' };
    }
    
    try {
        // Make a direct API call to test the service role
        const response = await fetch(`${supabaseUrl}/rest/v1/user_enrollments?select=count`, {
            method: 'GET',
            headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });
        
        console.log('📡 API Response Status:', response.status);
        console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.text();
            console.log('✅ Service role key working! Response:', data);
            return { success: true, data };
        } else {
            const errorText = await response.text();
            console.error('❌ Service role key failed:', response.status, errorText);
            return { success: false, error: `${response.status}: ${errorText}` };
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        return { success: false, error: `Network error: ${error}` };
    }
};