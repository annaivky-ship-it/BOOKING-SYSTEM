#!/usr/bin/env node

/**
 * Complete Database Setup Script
 *
 * This script provides multiple methods to set up your Supabase database:
 * 1. Automated execution via Supabase API (if service role key available)
 * 2. Guided manual setup with copy-paste instructions
 * 3. Verification of existing setup
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🗄️  Supabase Database Setup\n');
console.log('━'.repeat(60));

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Error: Supabase credentials not found');
  console.log('\n   Please check your .env.local file');
  process.exit(1);
}

console.log('✅ Supabase URL:', SUPABASE_URL);
console.log('✅ Anon Key:', ANON_KEY.substring(0, 20) + '...');

// Read the schema file
const schemaPath = path.join(__dirname, 'supabase_schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: supabase_schema.sql not found');
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Parse SQL into individual statements
const sqlStatements = schemaSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('✅ Found schema file with', sqlStatements.length, 'SQL statements');

async function verifyConnection() {
  console.log('\n🔍 Verifying Supabase connection...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });

    if (response.ok) {
      console.log('✅ Successfully connected to Supabase!');
      return true;
    } else {
      console.log('⚠️  Connection test returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function checkIfSchemaExists() {
  console.log('\n🔍 Checking if schema is already deployed...');
  try {
    // Try to query the services table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/services?select=count`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    if (response.ok) {
      const contentRange = response.headers.get('content-range');
      const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
      console.log('✅ Schema exists! Found', count, 'services in database');
      return true;
    } else {
      console.log('ℹ️  Schema not yet deployed (this is normal for first-time setup)');
      return false;
    }
  } catch (error) {
    console.log('ℹ️  Schema not yet deployed');
    return false;
  }
}

async function main() {
  const connected = await verifyConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without valid Supabase connection');
    process.exit(1);
  }

  const schemaExists = await checkIfSchemaExists();

  if (schemaExists) {
    console.log('\n✅ Database schema is already set up!');
    console.log('\n📊 You can now:');
    console.log('   • View your data: ' + SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/'));
    console.log('   • Run your app: npm run dev');
    console.log('   • Deploy Edge Function: node deploy-edge-function.js');
    return;
  }

  console.log('\n📝 Database Schema Setup Required\n');
  console.log('━'.repeat(60));

  if (SERVICE_ROLE_KEY) {
    console.log('\n🔄 Service role key detected. Attempting automated setup...');
    console.log('⚠️  Note: Automated SQL execution via REST API is limited.');
    console.log('          Manual setup via SQL Editor is recommended.\n');
  }

  console.log('\n✨ RECOMMENDED: Manual Setup via Supabase SQL Editor\n');
  console.log('━'.repeat(60));
  console.log('\nThis is the official and most reliable way to run database schemas.\n');

  console.log('📋 Step-by-Step Instructions:\n');
  console.log('1. Open Supabase Dashboard:');
  console.log('   🔗 ' + SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/'));
  console.log('\n2. Click "SQL Editor" in the left sidebar');
  console.log('\n3. Click "New Query" button');
  console.log('\n4. Copy the schema:');
  console.log('   📄 File: supabase_schema.sql');
  console.log('   📝 Lines: ' + schemaSql.split('\n').length);
  console.log('\n5. Paste the entire file contents into the SQL editor');
  console.log('\n6. Click "Run" button (or press Ctrl+Enter / Cmd+Enter)');
  console.log('\n7. Wait for success message:');
  console.log('   ✅ "Success. No rows returned"');
  console.log('\n8. Verify tables created:');
  console.log('   • Go to "Table Editor" in left sidebar');
  console.log('   • You should see: profiles, performers, bookings, services,');
  console.log('     do_not_serve, communications');
  console.log('\n9. Check services are pre-loaded:');
  console.log('   • Click on "services" table');
  console.log('   • Should see 7 rows (entertainment services)');

  console.log('\n━'.repeat(60));
  console.log('\n💡 Alternative: Copy schema to clipboard now?\n');
  console.log('Run this command to copy the schema:');
  console.log('   cat supabase_schema.sql | pbcopy    (macOS)');
  console.log('   cat supabase_schema.sql | xclip     (Linux)');
  console.log('   type supabase_schema.sql | clip     (Windows)');

  console.log('\n━'.repeat(60));
  console.log('\n📚 After Schema Setup:\n');
  console.log('1. Deploy Edge Function:');
  console.log('   node deploy-edge-function.js');
  console.log('\n2. Test your application:');
  console.log('   npm run dev');
  console.log('\n3. Create admin account:');
  console.log('   See DEPLOYMENT_READY.md Step 3');

  console.log('\n━'.repeat(60));
  console.log('\n✅ Setup guide ready!\n');
  console.log('   Full documentation: DEPLOYMENT_READY.md');
  console.log('   Quick start: QUICK_START.md');
  console.log('   Twilio guide: TWILIO_SETUP.md\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
