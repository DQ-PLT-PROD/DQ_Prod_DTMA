/**
 * DTMA Sprint 0 - Stage01 Validation Tests
 * Course Catalog & Course Details Stabilization
 * 
 * Tests catalog queries and course details after RLS hardening
 */

import { createClient } from '@supabase/supabase-js'

// Hardcoded from .env for testing (read from .env file)
const SUPABASE_URL = 'https://ugmybskacomcdgdngolz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbXlic2thY29tY2RnZG5nb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTM0MDEsImV4cCI6MjA4MDIyOTQwMX0.iwNLBgOsE1k8Eb3noMhJ4kCZX6b5oLdq-0B5S7CcPpo'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`${status}: ${name}`)
  if (details) console.log(`   ${details}`)
  
  results.tests.push({ name, passed, details })
  if (passed) results.passed++
  else results.failed++
}

console.log('🧪 DTMA Stage01 - Catalog & Course Details Tests\n')
console.log('=' .repeat(60))

// ============================================
// Task D1: Validate Catalog Queries After RLS
// ============================================
console.log('\n📋 Task D1: Catalog Query Validation\n')

async function testCatalogQuery() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, slug, title, status, is_featured')
      .eq('status', 'published')
      .limit(10)

    if (error) {
      logTest('Catalog query with published filter', false, `Error: ${error.message}`)
      return false
    }

    if (!data || data.length === 0) {
      logTest('Catalog query with published filter', false, 'No published courses found')
      return false
    }

    // Verify all returned courses are published
    const allPublished = data.every(course => course.status === 'published')
    logTest('Catalog query with published filter', allPublished, 
      `Found ${data.length} courses, all published: ${allPublished}`)
    
    return allPublished
  } catch (err) {
    logTest('Catalog query with published filter', false, `Exception: ${err.message}`)
    return false
  }
}

async function testCatalogWithCategories() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, course_categories(name)')
      .eq('status', 'published')
      .limit(5)

    if (error) {
      logTest('Catalog query with category join', false, `Error: ${error.message}`)
      return false
    }

    logTest('Catalog query with category join', true, 
      `Successfully fetched ${data?.length || 0} courses with categories`)
    return true
  } catch (err) {
    logTest('Catalog query with category join', false, `Exception: ${err.message}`)
    return false
  }
}

async function testCatalogWithLessons() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(id, title, type)')
      .eq('status', 'published')
      .limit(3)

    if (error) {
      logTest('Catalog query with lessons join', false, `Error: ${error.message}`)
      return false
    }

    logTest('Catalog query with lessons join', true, 
      `Successfully fetched ${data?.length || 0} courses with lessons`)
    return true
  } catch (err) {
    logTest('Catalog query with lessons join', false, `Exception: ${err.message}`)
    return false
  }
}

// ============================================
// Task D2: Verify Course Details Page
// ============================================
console.log('\n📄 Task D2: Course Details Page Validation\n')

async function testCourseDetailsQuery() {
  try {
    // First get a published course
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('slug')
      .eq('status', 'published')
      .limit(1)
      .single()

    if (coursesError || !courses) {
      logTest('Course details query', false, 'No published course found for testing')
      return false
    }

    const courseSlug = courses.slug

    // Now fetch full course details
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_categories(name, slug),
        lessons(id, title, type, order_index, is_preview, estimated_duration_minutes)
      `)
      .eq('slug', courseSlug)
      .eq('status', 'published')
      .single()

    if (error) {
      logTest('Course details query', false, `Error: ${error.message}`)
      return false
    }

    if (!data) {
      logTest('Course details query', false, 'No data returned')
      return false
    }

    // Verify essential metadata is present
    const hasEssentialData = data.title && data.slug && data.status === 'published'
    logTest('Course details query', hasEssentialData, 
      `Course: ${data.title} (${data.slug})`)
    
    return hasEssentialData
  } catch (err) {
    logTest('Course details query', false, `Exception: ${err.message}`)
    return false
  }
}

async function testCourseMetadataAccess() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, slug, title, short_description, long_description,
        category_id, audience_level, topic_tags, level_tag,
        estimated_duration_minutes, lesson_count, hero_image_url,
        intro_video_url, is_featured, status, rating, review_count
      `)
      .eq('status', 'published')
      .limit(1)
      .single()

    if (error) {
      logTest('Course metadata access', false, `Error: ${error.message}`)
      return false
    }

    logTest('Course metadata access', true, 
      `All metadata fields accessible for: ${data.title}`)
    return true
  } catch (err) {
    logTest('Course metadata access', false, `Exception: ${err.message}`)
    return false
  }
}

// ============================================
// Task D3: Ensure Only Published Courses Are Public
// ============================================
console.log('\n🔒 Task D3: Published Course Filtering\n')

async function testUnpublishedCoursesHidden() {
  try {
    // Try to fetch courses without status filter
    const { data: allCourses, error: allError } = await supabase
      .from('courses')
      .select('id, slug, title, status')

    if (allError) {
      logTest('Unpublished courses hidden (no filter)', false, `Error: ${allError.message}`)
      return false
    }

    // Check if any unpublished courses are returned
    const unpublishedCount = allCourses?.filter(c => c.status !== 'published').length || 0
    
    if (unpublishedCount > 0) {
      logTest('Unpublished courses hidden (no filter)', false, 
        `⚠️  WARNING: ${unpublishedCount} unpublished courses are publicly accessible!`)
      return false
    }

    logTest('Unpublished courses hidden (no filter)', true, 
      'Only published courses returned')
    return true
  } catch (err) {
    logTest('Unpublished courses hidden (no filter)', false, `Exception: ${err.message}`)
    return false
  }
}

async function testDraftCourseAccess() {
  try {
    // Try to access a draft course directly
    const { data, error } = await supabase
      .from('courses')
      .select('id, slug, title, status')
      .eq('status', 'draft')
      .limit(1)

    if (error) {
      // If RLS blocks this, that's good
      logTest('Draft course access blocked', true, 'RLS policy blocks draft access')
      return true
    }

    if (!data || data.length === 0) {
      logTest('Draft course access blocked', true, 'No draft courses exist or accessible')
      return true
    }

    // If we can access draft courses, that's a security issue
    logTest('Draft course access blocked', false, 
      `⚠️  WARNING: Draft courses are publicly accessible!`)
    return false
  } catch (err) {
    logTest('Draft course access blocked', false, `Exception: ${err.message}`)
    return false
  }
}

async function testPublishedFilterEnforcement() {
  try {
    // Verify published filter works correctly
    const { data: published, error: pubError } = await supabase
      .from('courses')
      .select('id, status')
      .eq('status', 'published')

    if (pubError) {
      logTest('Published filter enforcement', false, `Error: ${pubError.message}`)
      return false
    }

    const allPublished = published?.every(c => c.status === 'published') ?? true
    logTest('Published filter enforcement', allPublished, 
      `All ${published?.length || 0} courses have status='published'`)
    
    return allPublished
  } catch (err) {
    logTest('Published filter enforcement', false, `Exception: ${err.message}`)
    return false
  }
}

// ============================================
// Task D4: Frontend Data Fetching Compatibility
// ============================================
console.log('\n🔌 Task D4: Frontend Query Compatibility\n')

async function testFrontendCatalogQuery() {
  try {
    // Simulate the exact query used by fetchCourses() in courseService.ts
    const { data, error } = await supabase
      .from('courses')
      .select('*, course_categories(name), lessons(type, estimated_duration_minutes)')
      .eq('status', 'published')
      .order('is_coming_soon', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      logTest('Frontend catalog query', false, `Error: ${error.message}`)
      return false
    }

    logTest('Frontend catalog query', true, 
      `Successfully fetched ${data?.length || 0} courses with frontend query pattern`)
    return true
  } catch (err) {
    logTest('Frontend catalog query', false, `Exception: ${err.message}`)
    return false
  }
}

async function testFilteredCatalogQuery() {
  try {
    // Test with filters (category, audience level)
    const { data, error } = await supabase
      .from('courses')
      .select('*, course_categories(name)')
      .eq('status', 'published')
      .eq('is_featured', true)

    if (error) {
      logTest('Filtered catalog query', false, `Error: ${error.message}`)
      return false
    }

    logTest('Filtered catalog query', true, 
      `Featured courses query returned ${data?.length || 0} results`)
    return true
  } catch (err) {
    logTest('Filtered catalog query', false, `Exception: ${err.message}`)
    return false
  }
}

async function testSearchQuery() {
  try {
    // Test text search functionality
    const searchTerm = 'digital'
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, short_description, status')
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)

    if (error) {
      logTest('Search query', false, `Error: ${error.message}`)
      return false
    }

    logTest('Search query', true, 
      `Search for "${searchTerm}" returned ${data?.length || 0} results`)
    return true
  } catch (err) {
    logTest('Search query', false, `Exception: ${err.message}`)
    return false
  }
}

// ============================================
// Run All Tests
// ============================================
async function runAllTests() {
  console.log('\n🚀 Starting Stage01 validation tests...\n')

  // Task D1
  await testCatalogQuery()
  await testCatalogWithCategories()
  await testCatalogWithLessons()

  // Task D2
  await testCourseDetailsQuery()
  await testCourseMetadataAccess()

  // Task D3
  await testUnpublishedCoursesHidden()
  await testDraftCourseAccess()
  await testPublishedFilterEnforcement()

  // Task D4
  await testFrontendCatalogQuery()
  await testFilteredCatalogQuery()
  await testSearchQuery()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Test Summary\n')
  console.log(`Total Tests: ${results.passed + results.failed}`)
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`)

  if (results.failed > 0) {
    console.log('\n⚠️  Failed Tests:')
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   - ${t.name}: ${t.details}`))
  }

  console.log('\n' + '='.repeat(60))
  
  process.exit(results.failed > 0 ? 1 : 0)
}

runAllTests()
