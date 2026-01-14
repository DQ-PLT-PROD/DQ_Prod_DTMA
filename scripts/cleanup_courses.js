import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {};
        const content = fs.readFileSync(filePath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) env[match[1]] = (match[2] || '').replace(/^"|"$/g, '').trim();
        });
        return env;
    } catch (e) { return {}; }
}

const projectRoot = path.resolve(__dirname, '..');
const config = { ...loadEnv(path.join(projectRoot, '.env')), ...loadEnv(path.join(projectRoot, '.env.local')) };

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
    console.log('Clearing course-level estimated_duration_minutes and lesson_count...');

    const { data, error } = await supabase
        .from('courses')
        .update({
            estimated_duration_minutes: null,
            lesson_count: null
        })
        .not('id', 'is', null)
        .select('id');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Success! Updated ${data.length} courses.`);
    }
}

cleanup();
