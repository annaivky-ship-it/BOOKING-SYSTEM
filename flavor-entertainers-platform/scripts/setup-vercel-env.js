#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 *
 * This script helps set up environment variables for the Flavor Entertainers platform
 * Run this after configuring Google OAuth credentials
 */

const { execSync } = require('child_process');

console.log('🚀 Setting up Vercel Environment Variables for Flavor Entertainers Platform\n');

// Environment variables to set up
const environmentVariables = [
  {
    key: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth Client ID from Google Cloud Console',
    required: true,
    example: '123456789-abcdefghijklmnop.apps.googleusercontent.com'
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth Client Secret from Google Cloud Console',
    required: true,
    example: 'GOCSPX-abcdefghijklmnopqrstuvwxyz',
    sensitive: true
  },
  {
    key: 'NEXTAUTH_SECRET',
    description: 'NextAuth secret for production (32+ characters)',
    required: true,
    example: 'your-32-character-secret-here',
    sensitive: true
  },
  {
    key: 'NEXTAUTH_URL',
    description: 'Production URL for NextAuth',
    required: true,
    example: 'https://flavor-entertainers-platform-d1s2m5fa4.vercel.app'
  }
];

console.log('📋 Required Environment Variables:');
environmentVariables.forEach((env, index) => {
  console.log(`${index + 1}. ${env.key}`);
  console.log(`   Description: ${env.description}`);
  console.log(`   Example: ${env.sensitive ? '[HIDDEN]' : env.example}`);
  console.log(`   Required: ${env.required ? '✅ Yes' : '❌ No'}`);
  console.log('');
});

console.log('🔧 Manual Setup Instructions:');
console.log('');
console.log('1. Go to Vercel Dashboard: https://vercel.com/dashboard');
console.log('2. Select your "flavor-entertainers-platform" project');
console.log('3. Navigate to Settings > Environment Variables');
console.log('4. Add each environment variable above');
console.log('');

console.log('🔍 Google OAuth Setup Checklist:');
console.log('');
console.log('✅ Google Cloud Console:');
console.log('   - Create OAuth 2.0 Client ID');
console.log('   - Add redirect URI: https://flavor-entertainers-platform-d1s2m5fa4.vercel.app/auth/callback');
console.log('   - Copy Client ID and Client Secret');
console.log('');
console.log('✅ Supabase Configuration:');
console.log('   - Go to: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu');
console.log('   - Navigate to Authentication > Providers');
console.log('   - Enable Google provider');
console.log('   - Enter Google Client ID and Secret');
console.log('');
console.log('✅ Vercel Environment Variables:');
console.log('   - Add GOOGLE_CLIENT_ID');
console.log('   - Add GOOGLE_CLIENT_SECRET');
console.log('   - Add NEXTAUTH_SECRET');
console.log('   - Add NEXTAUTH_URL');
console.log('');

console.log('🧪 Testing Instructions:');
console.log('');
console.log('After setup, test the Google OAuth flow:');
console.log('1. Visit: https://flavor-entertainers-platform-d1s2m5fa4.vercel.app/auth/login');
console.log('2. Click "Continue with Google"');
console.log('3. Complete OAuth flow');
console.log('4. Verify user creation and dashboard redirect');
console.log('');

console.log('🎯 Automated Vercel CLI Commands (after getting credentials):');
console.log('');
console.log('# Add Google Client ID');
console.log('vercel env add GOOGLE_CLIENT_ID');
console.log('');
console.log('# Add Google Client Secret');
console.log('vercel env add GOOGLE_CLIENT_SECRET');
console.log('');
console.log('# Add NextAuth Secret');
console.log('vercel env add NEXTAUTH_SECRET');
console.log('');
console.log('# Add NextAuth URL');
console.log('vercel env add NEXTAUTH_URL');
console.log('');

console.log('✨ Once configured, redeploy the application:');
console.log('vercel --prod');
console.log('');

console.log('🔗 Helpful Links:');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- Supabase Dashboard: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Platform URL: https://flavor-entertainers-platform-d1s2m5fa4.vercel.app');
console.log('');

console.log('🎉 Google OAuth setup is ready! Follow the instructions above to complete configuration.');