
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Load environment variables manually
try {
  const envPath = join(projectRoot, '.env')
  const envFile = readFileSync(envPath, 'utf8')
  
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=')
      }
    }
  })
  console.log('✅ Environment variables loaded')
} catch (err) {
  console.log('⚠️ No .env file found, checking process env...')
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const TARGET_EMAIL = 'mchelesukuma@gmail.com'

async function unenrollUser() {
  console.log(`\n🔍 Looking up user: ${TARGET_EMAIL}`)
  
  // 1. Find User
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', TARGET_EMAIL)
    .single()

  if (userError || !users) {
    console.error('❌ User not found or error:', userError?.message)
    return
  }

  const userId = users.id
  console.log(`✅ User found: ${users.name} (${userId})`)

  // 2. Find Enrollments
  const { data: enrollments, error: enrollError } = await supabase
    .from('user_enrollments')
    .select('id, course_slug, created_at')
    .eq('user_id', userId)

  if (enrollError) {
    console.error('❌ Error fetching enrollments:', enrollError.message)
    return
  }

  if (!enrollments || enrollments.length === 0) {
    console.log('ℹ️ No active enrollments found for this user.')
    return
  }

  console.log(`\n📋 Found ${enrollments.length} enrollment(s):`)
  enrollments.forEach(e => console.log(`   - ${e.course_slug} (Enrollment ID: ${e.id})`))

  // 3. Unenroll
  console.log('\n🗑️  Unenrolling user and resetting progress...')

  for (const enrollment of enrollments) {
    // Delete progress first
    const { error: progressError, count: progressCount } = await supabase
      .from('lesson_progress')
      .delete({ count: 'exact' })
      .eq('enrollment_id', enrollment.id)

    if (progressError) {
      console.error(`   ❌ Error deleting progress for ${enrollment.course_slug}:`, progressError.message)
    } else {
      console.log(`   - Deleted ${progressCount} progress records for ${enrollment.course_slug}`)
    }

    // Delete enrollment
    const { error: deleteError } = await supabase
      .from('user_enrollments')
      .delete()
      .eq('id', enrollment.id)

    if (deleteError) {
      console.error(`   ❌ Failed to unenroll from ${enrollment.course_slug}:`, deleteError.message)
    } else {
      console.log(`   ✅ Successfully unenrolled from ${enrollment.course_slug}`)
    }
  }

  console.log('\n✨ Operation complete.')
}

unenrollUser().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
