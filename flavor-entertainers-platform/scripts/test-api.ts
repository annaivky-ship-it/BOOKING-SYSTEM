#!/usr/bin/env tsx

/**
 * API Test Script for Flavor Entertainers Platform
 *
 * This script tests the main API endpoints to ensure they're working correctly
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api'

interface TestResult {
  endpoint: string
  method: string
  status: number
  success: boolean
  error?: string
  data?: any
}

async function testEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  expectedStatus: number = 200
): Promise<TestResult> {
  try {
    const url = `${API_BASE}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    console.log(`🧪 Testing ${method} ${endpoint}`)

    const response = await fetch(url, options)
    const data = await response.json()

    const result: TestResult = {
      endpoint,
      method,
      status: response.status,
      success: response.status === expectedStatus,
      data
    }

    if (!result.success) {
      result.error = `Expected status ${expectedStatus}, got ${response.status}`
    }

    console.log(`${result.success ? '✅' : '❌'} ${method} ${endpoint} - ${response.status}`)

    return result

  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - ERROR`)
    return {
      endpoint,
      method,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests for Flavor Entertainers Platform')
  console.log(`📍 Base URL: ${API_BASE}`)
  console.log('=' * 60)

  const tests: TestResult[] = []

  // Test 1: Get Services
  tests.push(await testEndpoint('/services'))

  // Test 2: Get Performers
  tests.push(await testEndpoint('/performers'))

  // Test 3: Get Performers with filters
  tests.push(await testEndpoint('/performers?category=STRIP&verified=true'))

  // Test 4: Get Bookings
  tests.push(await testEndpoint('/bookings'))

  // Test 5: Get Vetting Applications
  tests.push(await testEndpoint('/vetting'))

  // Test 6: Admin Dashboard
  tests.push(await testEndpoint('/admin/dashboard'))

  // Test 7: Payment Transactions
  tests.push(await testEndpoint('/payments/transactions'))

  // Test 8: User Registration (should work even without database)
  tests.push(await testEndpoint('/auth/register', 'POST', {
    email: 'test@example.com',
    role: 'CLIENT',
    legal_name: 'Test User'
  }, 201))

  // Test 9: Create Service (should fail without auth)
  tests.push(await testEndpoint('/services', 'POST', {
    category: 'WAITRESS',
    name: 'Test Service',
    unit: 'PER_HOUR',
    base_rate: 50
  }, 403))

  // Test 10: Create Booking (should fail without proper data)
  tests.push(await testEndpoint('/bookings', 'POST', {
    performer_id: 'invalid-id',
    service_id: 'invalid-id',
    event_date: '2024-12-01',
    start_time: '20:00',
    duration_mins: 60,
    address: 'Test Address'
  }, 400))

  console.log('\n📊 Test Results Summary:')
  console.log('=' * 60)

  const passed = tests.filter(t => t.success).length
  const failed = tests.filter(t => !t.success).length

  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%`)

  if (failed > 0) {
    console.log('\n🔍 Failed Tests:')
    tests.filter(t => !t.success).forEach(test => {
      console.log(`   ${test.method} ${test.endpoint} - ${test.error}`)
    })
  }

  console.log('\n🎯 Next Steps:')
  if (failed === tests.length) {
    console.log('   1. Ensure the development server is running (npm run dev)')
    console.log('   2. Check database connection')
    console.log('   3. Verify environment variables')
  } else if (failed > 0) {
    console.log('   1. Configure database connection')
    console.log('   2. Run database setup script')
    console.log('   3. Set up authentication')
  } else {
    console.log('   🎉 All tests passed! Your API is ready!')
    console.log('   - Set up Twilio for WhatsApp notifications')
    console.log('   - Deploy to production')
  }

  return { passed, failed, total: tests.length }
}

if (require.main === module) {
  runTests()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch((error) => {
      console.error('💥 Test script failed:', error)
      process.exit(1)
    })
}

export default runTests