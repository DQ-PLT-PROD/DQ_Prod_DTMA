import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid dependencies
function loadEnv(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {};
        const content = fs.readFileSync(filePath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.replace(/^"|"$/g, '');
                }
                env[key] = value.trim();
            }
        });
        return env;
    } catch (e) {
        console.warn(`Failed to parse ${filePath}`, e);
        return {};
    }
}

// Load env vars
const projectRoot = path.resolve(__dirname, '..');
const envLocal = loadEnv(path.join(projectRoot, '.env.local'));
const env = loadEnv(path.join(projectRoot, '.env'));

const config = { ...env, ...envLocal };

const SUPABASE_URL = config.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = config.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
    console.log('Please ensure you have a .env.local file in the root directory with these variables.');
    process.exit(1);
}

console.log('Initializing Supabase client...');
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function clearLessonDurations() {
    console.log('Clearing estimated_duration_minutes for all lessons...');

    // We filter by id > 0 to match all rows (Supabase usually needs a filter for update/delete)
    const { data, error, count } = await supabase
        .from('lessons')
        .update({ estimated_duration_minutes: null })
        .not('id', 'is', null)
        .select('id');

    if (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error updating lessons:', error.message);
        process.exit(1);
    }

    console.log('\x1b[32m%s\x1b[0m', `Success! Cleared durations for ${data.length} lessons.`);
}

clearLessonDurations().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
