#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to check if your environment is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Booking Platform Setup...\n');

let hasErrors = false;

// Check .env.local exists
console.log('1️⃣ Checking environment file...');
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('   ❌ .env.local not found!');
  hasErrors = true;
} else {
  console.log('   ✅ .env.local exists');

  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ENCRYPTION_KEY'
  ];

  const missingVars = [];
  for (const varName of requiredVars) {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    if (!match || match[1].includes('your-') || match[1].includes('YOUR_')) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error(`   ⚠️  Missing or incomplete: ${missingVars.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('   ✅ All required environment variables set');
  }
}

// Check node_modules
console.log('\n2️⃣ Checking dependencies...');
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.error('   ❌ node_modules not found. Run: npm install');
  hasErrors = true;
} else {
  console.log('   ✅ Dependencies installed');
}

// Check database files
console.log('\n3️⃣ Checking database files...');
const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
const rlsPath = path.join(__dirname, 'supabase', 'rls-policies.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('   ❌ supabase/schema.sql not found');
  hasErrors = true;
} else {
  console.log('   ✅ schema.sql exists');
}

if (!fs.existsSync(rlsPath)) {
  console.error('   ❌ supabase/rls-policies.sql not found');
  hasErrors = true;
} else {
  console.log('   ✅ rls-policies.sql exists');
}

// Check key files
console.log('\n4️⃣ Checking project structure...');
const keyFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'app/page.tsx',
  'app/layout.tsx',
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/whatsapp.ts',
  'lib/validators.ts',
];

let allFilesExist = true;
for (const file of keyFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`   ❌ Missing: ${file}`);
    allFilesExist = false;
    hasErrors = true;
  }
}

if (allFilesExist) {
  console.log('   ✅ All key files present');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup incomplete. Please fix the errors above.\n');
  console.log('📚 See setup-database.md for database setup instructions');
  console.log('📚 See README.md for complete setup guide');
  process.exit(1);
} else {
  console.log('✅ Setup verification passed!\n');
  console.log('Next steps:');
  console.log('1. Follow setup-database.md to create database tables');
  console.log('2. Run: npm run dev');
  console.log('3. Open: http://localhost:3000');
  console.log('\n🚀 Happy coding!');
  process.exit(0);
}
