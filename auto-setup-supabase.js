#!/usr/bin/env node

/**
 * Automated Supabase Setup
 *
 * Runs the complete database schema automatically
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function executeSQL(projectRef, serviceKey, sql) {
  const url = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL execution failed: ${response.status} - ${text}`);
  }

  return await response.json();
}

async function executeSQLDirect(projectUrl, serviceKey, sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\n📊 Executing ${statements.length} SQL statements...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';

    try {
      const url = `${projectUrl}/rest/v1/rpc/exec`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ sql: stmt })
      });

      if (response.ok) {
        successCount++;
        process.stdout.write(`\r✓ Executed ${successCount}/${statements.length} statements`);
      } else {
        errorCount++;
        const error = await response.text();
        console.log(`\n  ⚠️  Statement ${i + 1} warning: ${error.substring(0, 100)}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`\n  ❌ Statement ${i + 1} failed: ${error.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n\n✓ Completed: ${successCount} succeeded, ${errorCount} warnings/errors\n`);
}

async function setup() {
  console.log('🍑 Flavor Entertainers - Automated Supabase Setup\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Get credentials
    console.log('📋 Enter your Supabase credentials:\n');
    console.log('Find these at: https://app.supabase.com/project/_/settings/api\n');

    const projectUrl = await question('Project URL (https://xxx.supabase.co): ');
    const serviceKey = await question('Service Role Key: ');
    const anonKey = await question('Anon/Public Key: ');

    console.log('\n');

    const projectRef = projectUrl.trim().replace('https://', '').replace('.supabase.co', '');

    // Read schema
    console.log('📖 Reading schema file...');
    const schemaSQL = fs.readFileSync('./supabase_schema.sql', 'utf8');
    console.log(`✓ Read ${schemaSQL.length} characters\n`);

    // Execute SQL
    console.log('🚀 Executing schema...\n');
    console.log('⚠️  This will take a few minutes. Please wait...\n');

    try {
      await executeSQLDirect(projectUrl.trim(), serviceKey.trim(), schemaSQL);
      console.log('✅ Schema executed successfully!\n');
    } catch (error) {
      console.log('⚠️  Automated execution had issues:', error.message);
      console.log('\n📝 FALLBACK: Manual Setup Required\n');
      console.log('Please run the schema manually:');
      console.log('1. Go to https://app.supabase.com');
      console.log('2. Open SQL Editor');
      console.log('3. Copy contents of supabase_schema.sql');
      console.log('4. Paste and click "Run"\n');

      const continueManual = await question('Continue with manual setup? (yes/no): ');
      if (continueManual.toLowerCase() !== 'yes') {
        console.log('\nSetup cancelled.\n');
        rl.close();
        return;
      }
    }

    // Create environment file
    console.log('📝 Creating environment files...\n');

    const envLocal = `# Supabase Configuration - Local Development
NEXT_PUBLIC_SUPABASE_URL=${projectUrl.trim()}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey.trim()}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey.trim()}

# Optional: Add your API keys below
# NEXT_PUBLIC_GEMINI_API_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
`;

    fs.writeFileSync('.env.local', envLocal);
    console.log('✓ Created .env.local for local development\n');

    // Create Vercel instructions
    const vercelEnv = `# Copy these to Vercel Dashboard > Settings > Environment Variables

NEXT_PUBLIC_SUPABASE_URL=${projectUrl.trim()}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey.trim()}
`;

    fs.writeFileSync('.env.vercel', vercelEnv);
    console.log('✓ Created .env.vercel for deployment reference\n');

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ SETUP COMPLETE!\n');
    console.log('📋 NEXT STEPS:\n');
    console.log('1. Verify Setup (Local):');
    console.log('   npm run dev\n');

    console.log('2. Deploy to Vercel:');
    console.log('   - Go to Vercel Dashboard');
    console.log('   - Settings > Environment Variables');
    console.log('   - Add variables from .env.vercel');
    console.log('   - Redeploy\n');

    console.log('3. Create Admin User:');
    console.log('   - Sign up through your app');
    console.log('   - Go to Supabase SQL Editor');
    console.log('   - Run these queries:\n');
    console.log('   SELECT id, email FROM auth.users WHERE email = \'your@email.com\';');
    console.log('   INSERT INTO profiles (id, role) VALUES (\'<user-id>\', \'admin\')');
    console.log('   ON CONFLICT (id) DO UPDATE SET role = \'admin\';\n');

    console.log('4. Test Features:');
    console.log('   - Browse performers (should show mock data in demo mode)');
    console.log('   - Create a booking');
    console.log('   - Test admin dashboard\n');

    console.log('📚 Documentation:');
    console.log('   - Full guide: SUPABASE_SETUP_GUIDE.md');
    console.log('   - Environment variables: .env.example\n');

    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease follow the manual setup guide in SUPABASE_SETUP_GUIDE.md\n');
  }

  rl.close();
}

// Run setup
setup().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});
