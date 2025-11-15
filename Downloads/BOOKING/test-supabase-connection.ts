// ============================================================================
// SUPABASE CONNECTION TEST
// ============================================================================
// Run this to verify your Supabase connection is working
// Usage: npx tsx test-supabase-connection.ts
// ============================================================================

import { supabase } from './services/supabaseClient';

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');

  try {
    // Test 1: Check connection
    console.log('Test 1: Verifying connection...');
    const { data, error } = await supabase.from('performers').select('count');

    if (error) {
      console.error('❌ Connection failed:', error.message);
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n⚠️  Tables not found!');
        console.log('📝 Run supabase-schema-complete.sql in Supabase Dashboard');
      }
      return;
    }

    console.log('✅ Connection successful!\n');

    // Test 2: Count performers
    console.log('Test 2: Counting performers...');
    const { count: performerCount, error: countError } = await supabase
      .from('performers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Failed to count performers:', countError.message);
      return;
    }

    console.log(`✅ Found ${performerCount} performers\n`);

    // Test 3: Get services
    console.log('Test 3: Fetching services...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, category, rate');

    if (servicesError) {
      console.error('❌ Failed to fetch services:', servicesError.message);
      return;
    }

    console.log(`✅ Found ${services?.length || 0} services`);
    if (services && services.length > 0) {
      console.log('\nSample services:');
      services.slice(0, 3).forEach(s => {
        console.log(`  - ${s.name} (${s.category}): $${s.rate}`);
      });
    }
    console.log();

    // Test 4: Get performers
    console.log('Test 4: Fetching performers...');
    const { data: performers, error: performersError } = await supabase
      .from('performers')
      .select('id, name, status')
      .limit(5);

    if (performersError) {
      console.error('❌ Failed to fetch performers:', performersError.message);
      return;
    }

    console.log(`✅ Found ${performers?.length || 0} performers`);
    if (performers && performers.length > 0) {
      console.log('\nPerformers:');
      performers.forEach(p => {
        console.log(`  - ${p.name} (${p.status})`);
      });
    }
    console.log();

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Performers: ${performerCount}`);
    console.log(`✅ Services: ${services?.length || 0}`);
    console.log('\n🚀 Your Supabase backend is ready!');
    console.log('Open http://localhost:3000 to view your app\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Check your Supabase URL and anon key');
    console.log('2. Verify tables exist in Supabase Dashboard');
    console.log('3. Run supabase-schema-complete.sql');
    console.log('4. Run supabase-seed-data.sql\n');
  }
}

// Run the test
testConnection();
