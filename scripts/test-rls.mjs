/**
 * RLS (Row Level Security) Test Script
 * Tests CRUD permissions on all Supabase tables using the anon key
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ugmybskacomcdgdngolz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbXlic2thY29tY2RnZG5nb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTM0MDEsImV4cCI6MjA4MDIyOTQwMX0.iwNLBgOsE1k8Eb3noMhJ4kCZX6b5oLdq-0B5S7CcPpo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tables = [
    'courses',
    'lessons',
    'users',
    'user_enrollments',
    'lesson_progress',
    'course_resources',
    'quizzes',
    'course_categories',
    'related_courses',
    'newsletter_subscribers'
];

async function testTable(table) {
    const result = { table, read: '?', insert: '?', update: '?', delete: '?' };

    // Test READ
    try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        result.read = error ? `❌ ${error.code}` : '✅ ALLOWED';
    } catch (e) {
        result.read = `❌ ${e.message}`;
    }

    // Test INSERT (will fail due to schema validation, but RLS check happens first)
    try {
        const { error } = await supabase.from(table).insert({ _test_: 'rls_check' });
        if (error) {
            // 42501 = RLS violation, 23502/23503 = schema error (means RLS passed)
            if (error.code === '42501') {
                result.insert = '❌ RLS DENIED';
            } else {
                result.insert = `✅ ALLOWED (schema: ${error.code})`;
            }
        } else {
            result.insert = '✅ ALLOWED';
        }
    } catch (e) {
        result.insert = `❌ ${e.message}`;
    }

    // Test UPDATE (on fake UUID)
    try {
        const { error } = await supabase.from(table).update({ _test_: 'rls' }).eq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
            if (error.code === '42501') {
                result.update = '❌ RLS DENIED';
            } else {
                result.update = `✅ (${error.code || '0 rows'})`;
            }
        } else {
            result.update = '✅ ALLOWED';
        }
    } catch (e) {
        result.update = `❌ ${e.message}`;
    }

    // Test DELETE (on fake UUID)
    try {
        const { error } = await supabase.from(table).delete().eq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
            if (error.code === '42501') {
                result.delete = '❌ RLS DENIED';
            } else {
                result.delete = `✅ (${error.code || '0 rows'})`;
            }
        } else {
            result.delete = '✅ ALLOWED';
        }
    } catch (e) {
        result.delete = `❌ ${e.message}`;
    }

    return result;
}

async function main() {
    console.log('\n🔐 RLS (Row Level Security) Test Results');
    console.log('=========================================');
    console.log('Using: ANON KEY (public, RLS-restricted)\n');

    const results = [];
    for (const table of tables) {
        const result = await testTable(table);
        results.push(result);
        console.log(`📋 ${table}`);
        console.log(`   READ: ${result.read}`);
        console.log(`   INSERT: ${result.insert}`);
        console.log(`   UPDATE: ${result.update}`);
        console.log(`   DELETE: ${result.delete}`);
        console.log('');
    }

    // Summary
    console.log('\n📊 SUMMARY');
    console.log('==========');
    console.log('Table'.padEnd(25) + 'READ'.padEnd(12) + 'INSERT'.padEnd(18) + 'UPDATE'.padEnd(18) + 'DELETE');
    console.log('-'.repeat(85));
    for (const r of results) {
        const read = r.read.includes('✅') ? '✅' : '❌';
        const insert = r.insert.includes('✅') ? '✅' : '❌';
        const update = r.update.includes('✅') ? '✅' : '❌';
        const del = r.delete.includes('✅') ? '✅' : '❌';
        console.log(r.table.padEnd(25) + read.padEnd(12) + insert.padEnd(18) + update.padEnd(18) + del);
    }
}

main().catch(console.error);
