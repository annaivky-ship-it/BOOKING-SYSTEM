const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yhxnxoqztndvgudqqlmd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeG54b3F6dG5kdmd1ZHFxbG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMjQzMTEsImV4cCI6MjA4MTcwMDMxMX0.oTUfU7UmALth1D8bP_luIAMKrOqFUjXlQMvbbuG53rM';

console.log('\n🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Test 1: Check services table
    console.log('📊 Test 1: Checking services table...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(3);

    if (servicesError) {
      console.log('❌ Services table error:', servicesError.message);
      console.log('\n⚠️  The database schema may not be set up yet.');
      console.log('   Run the schema in Supabase SQL Editor (see QUICK_START.md)\n');
    } else {
      console.log('✅ Services table accessible!');
      console.log(`   Found ${services.length} services\n`);
      if (services.length > 0) {
        console.log('   Sample:', services[0].name, '- $' + services[0].rate);
      }
    }

    // Test 2: Check performers table
    console.log('\n📊 Test 2: Checking performers table...');
    const { data: performers, error: performersError } = await supabase
      .from('performers')
      .select('*')
      .limit(3);

    if (performersError) {
      console.log('❌ Performers table error:', performersError.message);
    } else {
      console.log('✅ Performers table accessible!');
      console.log(`   Found ${performers.length} performers`);
    }

    // Test 3: Check auth
    console.log('\n🔐 Test 3: Checking authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Authentication system working!');
      console.log('   Session:', session ? 'Active' : 'No active session (expected)');
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Supabase connection successful!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. If schema errors above, run supabase_schema.sql in SQL Editor');
    console.log('2. Run: npm run dev');
    console.log('3. Open: http://localhost:3000');
    console.log('4. You should NOT see "Running in DEMO mode"\n');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check .env.local has correct credentials');
    console.log('2. Verify Supabase project is active');
    console.log('3. Check network connection\n');
  }
}

test();
