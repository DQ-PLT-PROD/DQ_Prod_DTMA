/**
 * Simple Production Hardening Test
 * Quick validation of rate limiting and logging features
 */

const API_BASE = 'http://localhost:3001/api'

async function testRateLimit() {
  console.log('🚦 Testing Rate Limiting...')
  
  try {
    const response = await fetch(`${API_BASE}/health`)
    const headers = Object.fromEntries(response.headers.entries())
    
    console.log('   Response Status:', response.status)
    console.log('   Rate Limit Headers:')
    console.log('   - X-RateLimit-Limit:', headers['x-ratelimit-limit'] || 'Missing')
    console.log('   - X-RateLimit-Remaining:', headers['x-ratelimit-remaining'] || 'Missing')
    console.log('   - X-RateLimit-Reset:', headers['x-ratelimit-reset'] || 'Missing')
    
    if (headers['x-ratelimit-limit']) {
      console.log('   ✅ Rate limiting is active')
      return true
    } else {
      console.log('   ❌ Rate limiting headers missing')
      return false
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    return false
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS Headers...')
  
  try {
    const response = await fetch(`${API_BASE}/health`)
    const headers = Object.fromEntries(response.headers.entries())
    
    console.log('   CORS Headers:')
    console.log('   - Access-Control-Allow-Origin:', headers['access-control-allow-origin'] || 'Missing')
    console.log('   - Access-Control-Allow-Methods:', headers['access-control-allow-methods'] || 'Missing')
    console.log('   - Access-Control-Allow-Headers:', headers['access-control-allow-headers'] || 'Missing')
    
    if (headers['access-control-allow-origin']) {
      console.log('   ✅ CORS is properly configured')
      return true
    } else {
      console.log('   ❌ CORS headers missing')
      return false
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    return false
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Handling...')
  
  try {
    // Test with invalid token
    const response = await fetch(`${API_BASE}/enrollment/status/test-course`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    
    console.log('   Invalid Token Response Status:', response.status)
    
    if (response.status === 401) {
      console.log('   ✅ Invalid tokens properly rejected')
      return true
    } else {
      console.log('   ❌ Invalid token not properly handled')
      return false
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    return false
  }
}

async function testStrictRateLimit() {
  console.log('\n🔒 Testing Strict Rate Limiting on Enrollment...')
  
  try {
    const response = await fetch(`${API_BASE}/enrollment/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseSlug: 'test-course',
        userId: 'test-user'
      })
    })
    
    const headers = Object.fromEntries(response.headers.entries())
    console.log('   Enrollment Endpoint Status:', response.status)
    console.log('   Rate Limit:', headers['x-ratelimit-limit'] || 'Missing')
    
    if (headers['x-ratelimit-limit']) {
      const limit = parseInt(headers['x-ratelimit-limit'])
      console.log(`   ✅ Strict rate limiting active: ${limit} requests`)
      return true
    } else {
      console.log('   ❌ Strict rate limiting not applied')
      return false
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🔧 Production Hardening Validation')
  console.log('==================================')
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${API_BASE}/health`)
    if (!healthCheck.ok) {
      console.log('❌ API server not accessible')
      return
    }
    console.log('✅ API server is running\n')
  } catch (error) {
    console.log('❌ Cannot connect to API server')
    return
  }

  const tests = [
    { name: 'Rate Limiting', fn: testRateLimit },
    { name: 'CORS Headers', fn: testCORS },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Strict Rate Limiting', fn: testStrictRateLimit }
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
      failed++
      console.log(`   ❌ ${test.name}: ERROR - ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(40))
  console.log('📊 Production Hardening Results')
  console.log('='.repeat(40))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All production hardening features working!')
    console.log('✅ Feature 02.1 is 100% compliant')
  } else {
    console.log('\n⚠️ Some features need attention')
  }
}

runTests().catch(console.error)