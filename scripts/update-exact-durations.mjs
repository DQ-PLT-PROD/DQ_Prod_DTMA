#!/usr/bin/env node
/**
 * Script to measure exact video durations (with seconds) and update the database
 * This stores the exact duration in seconds for precise display
 * 
 * Usage: node scripts/update-exact-durations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔑 Loaded credentials:');
console.log('   URL:', supabaseUrl ? '✓' : '✗');
console.log('   Key:', supabaseServiceKey ? '✓' : '✗');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Get video duration using Puppeteer
 */
async function getVideoDuration(browser, videoUrl) {
  const page = await browser.newPage();
  
  try {
    await page.setDefaultTimeout(30000);
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Video Duration</title></head>
        <body>
          <video id="video" preload="metadata" src="${videoUrl}"></video>
        </body>
      </html>
    `);
    
    const duration = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const video = document.getElementById('video');
        
        video.addEventListener('loadedmetadata', () => {
          resolve(video.duration);
        });
        
        video.addEventListener('error', (e) => {
          reject(new Error(`Video error: ${e.message || 'Unknown error'}`));
        });
        
        video.load();
        
        setTimeout(() => reject(new Error('Timeout loading video metadata')), 25000);
      });
    });
    
    return duration;
  } finally {
    await page.close();
  }
}

/**
 * Format seconds to MM:SS
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function measureAndUpdateDurations() {
  console.log('🎬 Starting exact video duration measurement...\n');
  
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, course_slug, title, video_url, duration_sec, order_index')
    .not('video_url', 'is', null)
    .order('course_slug', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('❌ Error fetching lessons:', error);
    process.exit(1);
  }

  console.log(`📊 Found ${lessons.length} lessons with videos\n`);
  
  console.log('🌐 Launching headless browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];
  const sqlUpdates = [];
  
  try {
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const progress = `[${i + 1}/${lessons.length}]`;
      
      try {
        console.log(`${progress} Measuring: ${lesson.course_slug} - ${lesson.title}`);
        
        const durationSeconds = await getVideoDuration(browser, lesson.video_url);
        const roundedSeconds = Math.round(durationSeconds);
        const formatted = formatDuration(durationSeconds);
        
        const needsUpdate = roundedSeconds !== lesson.duration_sec;
        
        results.push({
          id: lesson.id,
          course: lesson.course_slug,
          title: lesson.title,
          actualDuration: formatted,
          actualSeconds: roundedSeconds,
          currentSeconds: lesson.duration_sec,
          needsUpdate
        });
        
        if (needsUpdate) {
          sqlUpdates.push({
            id: lesson.id,
            title: lesson.title,
            seconds: roundedSeconds,
            formatted: formatted
          });
        }
        
        const status = needsUpdate ? '⚠️  NEEDS UPDATE' : '✓';
        console.log(`   ${status} Duration: ${formatted} (${roundedSeconds}s)\n`);
        
      } catch (err) {
        console.error(`   ✗ Failed: ${err.message}\n`);
        results.push({
          id: lesson.id,
          course: lesson.course_slug,
          title: lesson.title,
          error: err.message
        });
      }
    }
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(80));
  
  const byCourse = results.reduce((acc, r) => {
    if (!acc[r.course]) acc[r.course] = [];
    acc[r.course].push(r);
    return acc;
  }, {});
  
  for (const [course, lessons] of Object.entries(byCourse)) {
    const totalSeconds = lessons.reduce((sum, l) => sum + (l.actualSeconds || 0), 0);
    const totalFormatted = formatDuration(totalSeconds);
    console.log(`\n📚 ${course}: ${totalFormatted} total`);
    lessons.forEach(l => {
      if (l.error) {
        console.log(`   ✗ ${l.title}: ERROR - ${l.error}`);
      } else {
        const status = l.needsUpdate ? '⚠️ ' : '✓';
        console.log(`   ${status} ${l.title}: ${l.actualDuration}`);
      }
    });
  }

  // Print SQL statements
  if (sqlUpdates.length > 0) {
    console.log(`\n\n📝 SQL UPDATE STATEMENTS:`);
    console.log('='.repeat(80));
    console.log('-- Run these in Supabase SQL Editor:\n');
    sqlUpdates.forEach(u => {
      console.log(`UPDATE lessons SET duration_sec = ${u.seconds} WHERE id = '${u.id}'; -- ${u.title} (${u.formatted})`);
    });
    
    console.log('\n\n💡 After running the SQL, the UI will display exact durations like "5:21" instead of "6 mins"');
  } else {
    console.log('\n✅ All durations are already correct!');
  }
}

measureAndUpdateDurations()
  .then(() => {
    console.log('\n✅ Complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
