import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env');
console.log('Reading .env from:', envPath);

let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });
} catch (e) {
    console.error('Could not read .env file:', e);
}

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

console.log('Testing Supabase Connection...');
console.log('URL:', url);

const supabase = createClient(url, key);

async function test() {
    console.log('Fetching lessons for slug: perfecting-life-transactions');
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_slug', 'perfecting-life-transactions');

    if (error) {
        console.error('Error fetching lessons:', error);
    } else {
        console.log(`Found ${data.length} lessons.`);
        if (data.length > 0) {
            console.log('First lesson:', data[0].title);
            console.log('First lesson video_url:', data[0].video_url);
        } else {
            console.log('No lessons found. DB might be empty or slug incorrect.');
        }
    }

    console.log('Fetching resources...');
    const { data: resData, error: resError } = await supabase
        .from('course_resources')
        .select('*')
        .eq('course_slug', 'perfecting-life-transactions');

    if (resError) {
        console.error('Error fetching resources:', resError);
    } else {
        console.log(`Found ${resData.length} resources.`);
    }
}

test();
