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

async function checkTypes() {
    const { data, error } = await supabase
        .from('lessons')
        .select('title, type')
        .limit(20);

    if (error) console.error(error);
    else {
        console.log(JSON.stringify(data, null, 2));
    }
}

checkTypes();
