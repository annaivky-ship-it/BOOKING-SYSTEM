#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Flavor Entertainers - Vercel Deployment Script');
console.log('='.repeat(50));

// Essential environment variables for production
const REQUIRED_VARS = {
  // Supabase (Working)
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,

  // NextAuth (Essential)
  'NEXTAUTH_URL': 'https://flavor-entertainers-platform.vercel.app',
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET || 'change-this-in-production-min-32-chars',

  // App Configuration
  'NODE_ENV': 'production',
  'DEBUG': 'false',
  'LOG_LEVEL': 'error',

  // Security
  'JWT_SECRET': process.env.JWT_SECRET || 'change-this-jwt-secret-in-production',
  'ENCRYPTION_KEY': process.env.ENCRYPTION_KEY || '32-char-encryption-key-change-this!',

  // Rate Limiting
  'RATE_LIMIT_WINDOW_MS': '900000',
  'RATE_LIMIT_MAX_REQUESTS': '50',

  // CORS
  'CORS_ORIGIN': 'https://flavor-entertainers-platform.vercel.app',

  // File Upload
  'MAX_FILE_SIZE': '10485760',
  'ALLOWED_FILE_TYPES': 'image/jpeg,image/png,image/gif,video/mp4,audio/mp3,application/pdf'
};

// Optional variables (will be set if available)
const OPTIONAL_VARS = {
  'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
  'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN,
  'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER,
  'TWILIO_WHATSAPP_NUMBER': process.env.TWILIO_WHATSAPP_NUMBER,
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME,
  'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
  'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET,
  'STRIPE_PUBLISHABLE_KEY': process.env.STRIPE_PUBLISHABLE_KEY,
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET
};

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed`);
    return output;
  } catch {
    console.error(`❌ ${description} failed:`, error.message);
    return null;
  }
}

function setVercelEnvVar(key, value, target = 'production') {
  if (!value || value.includes('your_') || value.includes('change-this')) {
    console.log(`⚠️  Skipping ${key}: placeholder value detected`);
    return false;
  }

  const command = `vercel env add ${key} ${target}`;
  console.log(`🔑 Setting ${key}...`);

  try {
    // Use echo to pipe the value to vercel env add
    execSync(`echo "${value}" | ${command}`, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ Set ${key}`);
    return true;
  } catch {
    console.log(`⚠️  Failed to set ${key}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n📋 Deployment Checklist:');

  // Check if user is logged in
  try {
    execSync('vercel whoami', { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Logged in to Vercel');
  } catch {
    console.log('\n🔐 Please login to Vercel first:');
    console.log('Run: vercel login');
    process.exit(1);
  }

  // Check if project exists
  if (!fs.existsSync('.vercel')) {
    console.log('\n🔗 Linking project to Vercel...');
    runCommand('vercel link', 'Project linking');
  } else {
    console.log('✅ Project already linked to Vercel');
  }

  console.log('\n🔑 Setting environment variables...');

  let setCount = 0;
  let skippedCount = 0;

  // Set required variables
  console.log('\n📋 Required Variables:');
  for (const [key, value] of Object.entries(REQUIRED_VARS)) {
    if (setVercelEnvVar(key, value)) {
      setCount++;
    } else {
      skippedCount++;
    }
  }

  // Set optional variables
  console.log('\n🔧 Optional Variables:');
  for (const [key, value] of Object.entries(OPTIONAL_VARS)) {
    if (value) {
      if (setVercelEnvVar(key, value)) {
        setCount++;
      } else {
        skippedCount++;
      }
    } else {
      console.log(`⚠️  Skipping ${key}: not configured`);
      skippedCount++;
    }
  }

  console.log('\n📊 Environment Variables Summary:');
  console.log(`✅ Set: ${setCount} variables`);
  console.log(`⚠️  Skipped: ${skippedCount} variables`);

  console.log('\n🚀 Deploying to production...');
  const deployOutput = runCommand('vercel --prod', 'Production deployment');

  if (deployOutput) {
    console.log('\n🎉 Deployment successful!');
    console.log('\n🔗 Your app is live at:');
    console.log('https://flavor-entertainers-platform.vercel.app');

    console.log('\n📝 Next steps:');
    console.log('1. Add your real Twilio credentials for SMS/WhatsApp');
    console.log('2. Configure Cloudinary for file uploads');
    console.log('3. Set up Stripe for payments');
    console.log('4. Test all functionality on the live site');
  } else {
    console.log('\n❌ Deployment failed. Check the errors above.');
  }
}

main().catch(console.error);