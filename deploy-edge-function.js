#!/usr/bin/env node

/**
 * Supabase Edge Function Deployment Script
 *
 * This script helps deploy the Twilio Edge Function to Supabase.
 *
 * Requirements:
 * - Supabase CLI installed OR manual deployment via dashboard
 * - Twilio secrets configured in Supabase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const FUNCTION_PATH = path.join(__dirname, 'supabase/functions/send-message/index.ts');

console.log('\n📱 Supabase Edge Function Deployment\n');
console.log('━'.repeat(50));

// Check if function file exists
if (!fs.existsSync(FUNCTION_PATH)) {
  console.error('❌ Error: Edge function not found at', FUNCTION_PATH);
  process.exit(1);
}

console.log('✅ Found Edge Function: send-message');
console.log('✅ Supabase URL:', SUPABASE_URL);

// Check if Supabase CLI is installed
let cliInstalled = false;
try {
  execSync('supabase --version', { stdio: 'ignore' });
  cliInstalled = true;
  console.log('✅ Supabase CLI detected');
} catch (error) {
  console.log('⚠️  Supabase CLI not installed');
}

console.log('\n📋 Deployment Steps:\n');

if (cliInstalled) {
  console.log('Option A: Deploy via CLI (Automated)');
  console.log('━'.repeat(50));
  console.log('\n1. First, set Twilio secrets in Supabase:');
  console.log('   supabase secrets set TWILIO_ACCOUNT_SID=ACbe4fe93cad91172d1836bf0b1df21f9c');
  console.log('   supabase secrets set TWILIO_AUTH_TOKEN=00672b1766bef11e4d4cf8dc449c4bce');
  console.log('   supabase secrets set TWILIO_PHONE_NUMBER=+15088826327');
  console.log('   supabase secrets set TWILIO_WHATSAPP_NUMBER=+14155238886');
  console.log('\n2. Then deploy the function:');
  console.log('   supabase functions deploy send-message');
  console.log('\n3. Test the deployment:');
  console.log('   supabase functions invoke send-message --body \'{"to":"+15088826327","body":"Test","channel":"sms"}\'');
  console.log('\n');
}

console.log('Option ' + (cliInstalled ? 'B' : 'A') + ': Deploy via Supabase Dashboard (Manual)');
console.log('━'.repeat(50));
console.log('\n1. Add Twilio Secrets:');
console.log('   a. Go to: ' + SUPABASE_URL);
console.log('   b. Navigate to: Edge Functions > Secrets');
console.log('   c. Add these secrets:');
console.log('      • TWILIO_ACCOUNT_SID = ACbe4fe93cad91172d1836bf0b1df21f9c');
console.log('      • TWILIO_AUTH_TOKEN = 00672b1766bef11e4d4cf8dc449c4bce');
console.log('      • TWILIO_PHONE_NUMBER = +15088826327');
console.log('      • TWILIO_WHATSAPP_NUMBER = +14155238886');
console.log('\n2. Deploy the Function:');
console.log('   a. Go to: Edge Functions (left sidebar)');
console.log('   b. Click "Create Function"');
console.log('   c. Name: send-message');
console.log('   d. Copy contents from: supabase/functions/send-message/index.ts');
console.log('   e. Paste into the editor');
console.log('   f. Click "Deploy"');
console.log('\n3. Verify Deployment:');
console.log('   a. Click on "send-message" function');
console.log('   b. Go to "Logs" tab');
console.log('   c. Test by creating a booking in your app');
console.log('   d. Check logs for successful execution');

console.log('\n📚 Full Guide: See TWILIO_SETUP.md for detailed instructions');
console.log('\n' + '━'.repeat(50));

// Show the function code
console.log('\n📄 Edge Function Code Preview:\n');
const functionCode = fs.readFileSync(FUNCTION_PATH, 'utf8');
const preview = functionCode.split('\n').slice(0, 20).join('\n');
console.log(preview);
console.log('\n... (see full code in ' + FUNCTION_PATH + ')\n');

console.log('━'.repeat(50));
console.log('\n✅ Ready to deploy Edge Function!');
console.log('\n💡 Tip: Manual deployment via dashboard is recommended for first-time setup');
console.log('         as it provides better visibility into the deployment process.\n');
