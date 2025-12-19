#!/usr/bin/env node

/**
 * Supabase Schema Deployment Script
 *
 * This script attempts to run the supabase_schema.sql file
 * against your Supabase project.
 *
 * Requirements:
 * - SUPABASE_URL environment variable
 * - SUPABASE_SERVICE_ROLE_KEY environment variable (from Supabase Dashboard)
 *
 * Note: The SERVICE_ROLE_KEY is different from the ANON_KEY.
 * Get it from: Supabase Dashboard > Settings > API > service_role key
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🚀 Supabase Schema Deployment\n');
console.log('━'.repeat(50));

// Check for required environment variables
if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL not found in environment variables');
  console.log('\nPlease set NEXT_PUBLIC_SUPABASE_URL in your .env.local file');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  console.log('\n📋 To get your Service Role Key:');
  console.log('   1. Go to: ' + SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/'));
  console.log('   2. Click Settings > API');
  console.log('   3. Copy the "service_role" key (NOT the anon key)');
  console.log('   4. Add to .env.local:');
  console.log('      SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.log('\n⚠️  IMPORTANT: The service_role key is SECRET - never commit it to git!');
  console.log('\n📝 Alternative: Run the schema manually:');
  console.log('   1. Open: ' + SUPABASE_URL);
  console.log('   2. Go to SQL Editor');
  console.log('   3. Copy contents of supabase_schema.sql');
  console.log('   4. Paste and click "Run"');
  process.exit(1);
}

// Read the schema file
const schemaPath = path.join(__dirname, 'supabase_schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: supabase_schema.sql not found');
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('✅ Found schema file: supabase_schema.sql');
console.log('✅ Supabase URL:', SUPABASE_URL);
console.log('\n🔄 Executing SQL schema...\n');

// Execute SQL via Supabase REST API
async function runSchema() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: schemaSql })
    });

    if (!response.ok) {
      // If the RPC endpoint doesn't exist, try using pg_* functions
      console.log('⚠️  Direct SQL execution not available via REST API');
      console.log('\n📝 Please run the schema manually:');
      console.log('   1. Go to: ' + SUPABASE_URL);
      console.log('   2. Click "SQL Editor" in the left sidebar');
      console.log('   3. Click "New Query"');
      console.log('   4. Copy the entire contents of supabase_schema.sql');
      console.log('   5. Paste into the editor');
      console.log('   6. Click "Run" (or press Ctrl+Enter)');
      console.log('   7. Wait for "Success. No rows returned" ✅');
      console.log('\n💡 This is the recommended way to run database schemas in Supabase.');
      return false;
    }

    const result = await response.json();
    console.log('✅ Schema executed successfully!');
    console.log(result);
    return true;
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    console.log('\n📝 Please run the schema manually in Supabase SQL Editor');
    console.log('   Instructions: See DEPLOYMENT_READY.md Step 1');
    return false;
  }
}

// Run the schema
runSchema().then(success => {
  if (success) {
    console.log('\n✅ Database schema setup complete!');
    console.log('\n📊 Next steps:');
    console.log('   1. Verify tables in Supabase Dashboard > Table Editor');
    console.log('   2. Deploy Edge Function: node deploy-edge-function.js');
    console.log('   3. Test the application: npm run dev');
  }
  console.log('\n' + '━'.repeat(50) + '\n');
});
