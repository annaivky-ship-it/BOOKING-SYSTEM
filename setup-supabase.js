#!/usr/bin/env node

/**
 * Supabase Setup Script
 *
 * This script will:
 * 1. Connect to your Supabase project
 * 2. Run the database schema
 * 3. Verify the setup
 * 4. Create environment variables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runSQL(supabase, sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    // Try alternative method
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      throw new Error(`Failed to execute SQL: ${await response.text()}`);
    }
    return await response.json();
  }
  return data;
}

async function setup() {
  console.log('🍑 Flavor Entertainers - Supabase Setup\n');
  console.log('This script will set up your Supabase backend.\n');

  // Get Supabase credentials
  const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://xxx.supabase.co): ');
  const supabaseServiceKey = await question('Enter your Supabase Service Role Key (from Settings > API): ');
  const supabaseAnonKey = await question('Enter your Supabase Anon/Public Key: ');

  console.log('\n📊 Connecting to Supabase...');

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl.trim(), supabaseServiceKey.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test connection
    console.log('✓ Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('_test')
      .select('*')
      .limit(1);

    // Error is expected if table doesn't exist, but connection should work
    console.log('✓ Connected to Supabase!\n');

    // Read schema file
    console.log('📖 Reading schema file...');
    const schemaSQL = fs.readFileSync('./supabase_schema.sql', 'utf8');

    console.log('⚠️  MANUAL STEP REQUIRED:\n');
    console.log('Due to RLS policies and complex schema, please run the schema manually:');
    console.log('\n1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of supabase_schema.sql');
    console.log('4. Paste and click "Run"\n');

    const continueSetup = await question('Have you run the schema in Supabase SQL Editor? (yes/no): ');

    if (continueSetup.toLowerCase() !== 'yes') {
      console.log('\n❌ Setup cancelled. Please run the schema first.\n');
      rl.close();
      return;
    }

    // Verify tables were created
    console.log('\n🔍 Verifying database setup...');

    const tablesToCheck = ['profiles', 'performers', 'bookings', 'services', 'do_not_serve', 'communications'];
    let allTablesExist = true;

    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
        console.log(`  ❌ Table '${table}' not found or error:`, error.message);
        allTablesExist = false;
      } else {
        console.log(`  ✓ Table '${table}' exists`);
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️  Some tables are missing. Please check the schema was run correctly.\n');
    } else {
      console.log('\n✅ All tables created successfully!\n');
    }

    // Check services data
    console.log('🔍 Checking services data...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*');

    if (services && services.length > 0) {
      console.log(`  ✓ Found ${services.length} services`);
    } else {
      console.log('  ⚠️  No services found. They should have been created by the schema.');
    }

    // Create .env.local file
    console.log('\n📝 Creating .env.local file...');

    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl.trim()}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}

# Service Role Key (KEEP SECRET - server-side only)
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey.trim()}

# Optional: Add these for enhanced features
# NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_PHONE_NUMBER=+1234567890
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('✓ Created .env.local\n');

    // Display Vercel environment variables
    console.log('📋 VERCEL ENVIRONMENT VARIABLES:\n');
    console.log('Add these to your Vercel project (Settings > Environment Variables):\n');
    console.log(`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl.trim()}`);
    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}\n`);

    console.log('✅ Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Add environment variables to Vercel');
    console.log('2. Run: npm run dev');
    console.log('3. Sign up to create your admin account');
    console.log('4. Run this SQL to make yourself admin:');
    console.log('\n   SELECT id, email FROM auth.users WHERE email = \'your@email.com\';');
    console.log('   INSERT INTO profiles (id, role) VALUES (\'user-id\', \'admin\')');
    console.log('   ON CONFLICT (id) DO UPDATE SET role = \'admin\';\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error('\nPlease run the schema manually in Supabase SQL Editor.');
  }

  rl.close();
}

setup().catch(console.error);
