#!/usr/bin/env node
/**
 * Script to fetch actual video durations and update the database
 * This reads video metadata from actual video files and updates lesson durations
 * 
 * Usage: node scripts/update-video-durations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get video duration using a headless approach (requires video URL to be accessible)
 * Note: This is a placeholder - actual implementation would need a video processing library
 * or browser automation to read video metadata
 */
async function getVideoDurationFromUrl(videoUrl) {
  // For now, return null to indicate we need manual entry or browser-based detection
  // In production, you could use:
  // - ffprobe (requires ffmpeg installed)
  // - puppeteer (browser automation)
  // - video processing libraries
  console.log(`⚠️  Cannot auto-detect duration for: ${videoUrl}`);
  console.log('   Please use the browser-based detection or manually enter durations');
  return null;
}

async function updateLessonDurations() {
  console.log('🎬 Fetching lessons with video URLs...\n');

  // Fetch all lessons with video URLs
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, course_slug, title, video_url, estimated_duration_minutes')
    .not('video_url', 'is', null)
    .order('course_slug', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('❌ Error fetching lessons:', error);
    return;
  }

  console.log(`📊 Found ${lessons.length} lessons with videos\n`);
  console.log('⚠️  NOTE: Automatic video duration detection requires browser environment');
  console.log('   The frontend will automatically detect durations when users view courses\n');
  console.log('📋 Lessons that need duration updates:\n');

  // Group by course
  const lessonsByCourse = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.course_slug]) {
      acc[lesson.course_slug] = [];
    }
    acc[lesson.course_slug].push(lesson);
    return acc;
  }, {});

  // Display summary
  for (const [courseSlug, courseLessons] of Object.entries(lessonsByCourse)) {
    console.log(`\n📚 Course: ${courseSlug}`);
    console.log(`   Lessons: ${courseLessons.length}`);
    
    courseLessons.forEach(lesson => {
      const status = lesson.estimated_duration_minutes 
        ? `✓ ${lesson.estimated_duration_minutes} min` 
        : '⚠️  No duration';
      console.log(`   - ${lesson.title}: ${status}`);
    });
  }

  console.log('\n\n💡 RECOMMENDATION:');
  console.log('   The system will automatically detect video durations in the browser.');
  console.log('   Durations will be calculated when users view course details pages.');
  console.log('\n   To manually set durations, run this SQL in Supabase:');
  console.log('   UPDATE lessons SET estimated_duration_minutes = <actual_minutes> WHERE id = <lesson_id>;');
}

// Run the script
updateLessonDurations()
  .then(() => {
    console.log('\n✅ Scan complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
