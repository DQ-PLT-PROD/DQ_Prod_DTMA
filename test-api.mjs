#!/usr/bin/env node

/**
 * Test script for DTMA Enrollment APIs
 * Tests all enrollment endpoints to ensure they work correctly
 */

const API_BASE = 'http://localhost:3001/api'

// Test data
const testUserId = '550e8400-e29b-41d4-a716-446655440000' // Valid UUID format
const testCourseSlug = 'plt-course' // Use existing course from database

async function makeRequest(method, url, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    
    return {
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    }
  }
}

async function createTestUser() {
  console.log('\n👤 Creating Test User...')
  const result = await makeRequest('POST', `${API_BASE}/test/create-user`, {
    userId: testUserId,
    azureUserId: `azure-${testUserId}`,
    email: `test-${testUserId}@example.com`,
    name: 'Test User for API Testing'
  })
  
  if (result.ok) {
    console.log('✅ Test user creation passed:', result.data)
  } else {
    console.log('❌ Test user creation failed:', result)
  }
  
  return result.ok
}

async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...')
  const result = await makeRequest('GET', `${API_BASE}/health`)
  
  if (result.ok) {
    console.log('✅ Health check passed:', result.data)
  } else {
    console.log('❌ Health check failed:', result)
  }
  
  return result.ok
}

async function testEnrollmentStatus() {
  console.log('\n📊 Testing Enrollment Status Check...')
  const result = await makeRequest('GET', `${API_BASE}/enrollment/status/${testCourseSlug}?userId=${testUserId}`)
  
  if (result.ok) {
    console.log('✅ Enrollment status check passed:', result.data)
  } else {
    console.log('❌ Enrollment status check failed:', result)
  }
  
  return result.ok
}

async function testEnrollInCourse() {
  console.log('\n📝 Testing Course Enrollment...')
  const result = await makeRequest('POST', `${API_BASE}/enrollment/enroll`, {
    userId: testUserId,
    courseSlug: testCourseSlug,
    method: 'explicit'
  })
  
  if (result.ok) {
    console.log('✅ Course enrollment passed:', result.data)
  } else {
    console.log('❌ Course enrollment failed:', result)
  }
  
  return result.ok
}

async function testEnrollmentDetails() {
  console.log('\n📋 Testing Enrollment Details...')
  const result = await makeRequest('GET', `${API_BASE}/enrollment/details/${testCourseSlug}?userId=${testUserId}`)
  
  if (result.ok) {
    console.log('✅ Enrollment details passed:', result.data)
  } else {
    console.log('❌ Enrollment details failed:', result)
  }
  
  return result.ok
}

async function testUserEnrollments() {
  console.log('\n👤 Testing User Enrollments...')
  const result = await makeRequest('GET', `${API_BASE}/enrollment/user/${testUserId}`)
  
  if (result.ok) {
    console.log('✅ User enrollments passed:', result.data)
  } else {
    console.log('❌ User enrollments failed:', result)
  }
  
  return result.ok
}

async function testAccessContract() {
  console.log('\n🔐 Testing Access Contract...')
  const result = await makeRequest('GET', `${API_BASE}/enrollment/access/${testCourseSlug}?userId=${testUserId}`)
  
  if (result.ok) {
    console.log('✅ Access contract passed:', result.data)
  } else {
    console.log('❌ Access contract failed:', result)
  }
  
  return result.ok
}

async function testIdempotency() {
  console.log('\n🔄 Testing Enrollment Idempotency...')
  const result = await makeRequest('POST', `${API_BASE}/enrollment/enroll`, {
    userId: testUserId,
    courseSlug: testCourseSlug,
    method: 'explicit'
  })
  
  if (result.ok && result.data.message === 'Already enrolled') {
    console.log('✅ Idempotency test passed:', result.data)
  } else {
    console.log('❌ Idempotency test failed:', result)
  }
  
  return result.ok
}

async function testCancelEnrollment() {
  console.log('\n❌ Testing Enrollment Cancellation...')
  const result = await makeRequest('POST', `${API_BASE}/enrollment/cancel`, {
    userId: testUserId,
    courseSlug: testCourseSlug
  })
  
  if (result.ok) {
    console.log('✅ Enrollment cancellation passed:', result.data)
  } else {
    console.log('❌ Enrollment cancellation failed:', result)
  }
  
  return result.ok
}

async function runAllTests() {
  console.log('🚀 Starting DTMA Enrollment API Tests...')
  console.log(`📍 API Base URL: ${API_BASE}`)
  console.log(`👤 Test User ID: ${testUserId}`)
  console.log(`📚 Test Course Slug: ${testCourseSlug}`)
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Create Test User', fn: createTestUser },
    { name: 'Enrollment Status (Before)', fn: testEnrollmentStatus },
    { name: 'Enroll in Course', fn: testEnrollInCourse },
    { name: 'Enrollment Details', fn: testEnrollmentDetails },
    { name: 'User Enrollments', fn: testUserEnrollments },
    { name: 'Access Contract', fn: testAccessContract },
    { name: 'Idempotency Check', fn: testIdempotency },
    { name: 'Cancel Enrollment', fn: testCancelEnrollment },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw error:`, error.message)
      failed++
    }
  }
  
  console.log('\n📊 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend enrollment APIs are working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Check the output above for details.')
  }
}

// Run the tests
runAllTests().catch(console.error)