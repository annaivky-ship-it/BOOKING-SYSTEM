// Test Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\nChecking performers table...');
    const { data: performers, error: perfError } = await supabase
      .from('performers')
      .select('*')
      .limit(5);
    
    if (perfError) {
      console.error('Error:', perfError.message);
    } else {
      console.log('Success! Found', performers.length, 'performers');
    }

    console.log('\nChecking users table...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (userError) {
      console.error('Error:', userError.message);
    } else {
      console.log('Success! Users table accessible');
    }

    console.log('\nConnection test complete!');
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

testConnection();
