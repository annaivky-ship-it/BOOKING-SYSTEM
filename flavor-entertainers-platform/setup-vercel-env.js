#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * This script helps set up environment variables for Vercel deployment
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = prompt => {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
};

// Required environment variables
const REQUIRED_VARS = [
  {
    name: 'NEXTAUTH_SECRET',
    description: 'Secret for NextAuth.js (minimum 32 characters)',
    generate: () => require('crypto').randomBytes(32).toString('base64'),
  },
  {
    name: 'JWT_SECRET',
    description: 'Secret for JWT tokens (minimum 32 characters)',
    generate: () => require('crypto').randomBytes(32).toString('base64'),
  },
  {
    name: 'ENCRYPTION_KEY',
    description: '32-character encryption key',
    generate: () => require('crypto').randomBytes(32).toString('hex').substring(0, 32),
  },
];

// Optional environment variables
const OPTIONAL_VARS = [
  {
    name: 'TWILIO_ACCOUNT_SID',
    description: 'Twilio Account SID (for SMS notifications)',
    example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    description: 'Twilio Auth Token',
    example: 'your_auth_token_here',
  },
  {
    name: 'TWILIO_PHONE_NUMBER',
    description: 'Twilio Phone Number (Australian format)',
    example: '+61412345678',
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth Client ID',
    example: 'your_google_client_id.apps.googleusercontent.com',
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth Client Secret',
    example: 'GOCSPX-your_client_secret',
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe Publishable Key',
    example: 'pk_live_your_publishable_key',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe Secret Key',
    example: 'sk_live_your_secret_key',
  },
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    description: 'Cloudinary Cloud Name',
    example: 'your_cloud_name',
  },
  {
    name: 'CLOUDINARY_API_KEY',
    description: 'Cloudinary API Key',
    example: '123456789012345',
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    description: 'Cloudinary API Secret',
    example: 'your_api_secret',
  },
];

async function setupEnvironmentVariables() {
  console.log('🚀 Flavor Entertainers - Vercel Environment Setup');
  console.log('='.repeat(50));

  // Check if vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ Vercel CLI not found. Please install it first:');
    console.log('npm i -g vercel');
    process.exit(1);
  }

  console.log('✅ Vercel CLI found');

  // Set production URL
  const productionUrl = await question(
    '🌐 Enter your production URL (e.g., https://your-app.vercel.app): '
  );

  console.log('\n📋 Setting up required environment variables...');

  // Set required variables
  for (const varConfig of REQUIRED_VARS) {
    console.log(`\n🔧 Setting up ${varConfig.name}`);
    console.log(`Description: ${varConfig.description}`);

    let value = await question(`Enter value (or press Enter to auto-generate): `);

    if (!value && varConfig.generate) {
      value = varConfig.generate();
      console.log(`✨ Generated: ${value.substring(0, 10)}...`);
    }

    if (value) {
      try {
        execSync(`vercel env add ${varConfig.name} production`, {
          input: value,
          stdio: ['pipe', 'pipe', 'inherit'],
        });
        console.log(`✅ ${varConfig.name} set successfully`);
      } catch (error) {
        console.log(`❌ Failed to set ${varConfig.name}`);
      }
    }
  }

  // Set NEXTAUTH_URL
  try {
    execSync(`vercel env add NEXTAUTH_URL production`, {
      input: productionUrl,
      stdio: ['pipe', 'pipe', 'inherit'],
    });
    console.log(`✅ NEXTAUTH_URL set to ${productionUrl}`);
  } catch (error) {
    console.log(`❌ Failed to set NEXTAUTH_URL`);
  }

  // Optional variables
  const setupOptional = await question(
    '\n🔧 Would you like to set up optional integrations? (y/N): '
  );

  if (setupOptional.toLowerCase() === 'y') {
    console.log('\n📋 Setting up optional environment variables...');

    for (const varConfig of OPTIONAL_VARS) {
      const setup = await question(`\n🔧 Set up ${varConfig.name}? (y/N): `);

      if (setup.toLowerCase() === 'y') {
        console.log(`Description: ${varConfig.description}`);
        console.log(`Example: ${varConfig.example}`);

        const value = await question(`Enter value: `);

        if (value) {
          try {
            execSync(`vercel env add ${varConfig.name} production`, {
              input: value,
              stdio: ['pipe', 'pipe', 'inherit'],
            });
            console.log(`✅ ${varConfig.name} set successfully`);
          } catch (error) {
            console.log(`❌ Failed to set ${varConfig.name}`);
          }
        }
      }
    }
  }

  console.log('\n🎉 Environment variables setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy your application: vercel --prod');
  console.log('2. Check environment variables: vercel env ls');
  console.log('3. View your deployment: vercel --prod');

  rl.close();
}

// Export for use as module or run directly
if (require.main === module) {
  setupEnvironmentVariables().catch(console.error);
}

module.exports = { setupEnvironmentVariables };
