#!/usr/bin/env tsx

/**
 * Simple Database Password Configuration Script
 *
 * This script lets you set the database password after getting it from Supabase dashboard
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function setDatabasePassword(password: string) {
  const envPath = join(process.cwd(), '.env.local')
  let envContent = readFileSync(envPath, 'utf-8')

  console.log('🔧 Updating database configuration...')

  // Update DATABASE_URL
  envContent = envContent.replace(
    /DATABASE_URL=postgresql:\/\/postgres\.fmezpefpletmnthrmupu:.+@/,
    `DATABASE_URL=postgresql://postgres.fmezpefpletmnthrmupu:${password}@`
  )

  // Update DIRECT_URL
  envContent = envContent.replace(
    /DIRECT_URL=postgresql:\/\/postgres\.fmezpefpletmnthrmupu:.+@/,
    `DIRECT_URL=postgresql://postgres.fmezpefpletmnthrmupu:${password}@`
  )

  writeFileSync(envPath, envContent)

  console.log('✅ Database password updated in .env.local')
  console.log('')
  console.log('🎯 Next steps:')
  console.log('1. Deploy schema: npm run db:push')
  console.log('2. Seed database: npm run db:seed')
  console.log('3. Test API: npm run test:api')
}

function main() {
  console.log('🔐 Database Password Configuration')
  console.log('=' * 40)
  console.log('')

  const password = process.argv[2]

  if (!password) {
    console.log('📋 Instructions:')
    console.log('1. Go to: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu')
    console.log('2. Navigate to: Settings → Database')
    console.log('3. Copy your database password')
    console.log('4. Run this script with the password:')
    console.log('')
    console.log('   npx tsx scripts/set-db-password.ts YOUR_PASSWORD_HERE')
    console.log('')
    console.log('Or use the npm script:')
    console.log('')
    console.log('   npm run db:configure YOUR_PASSWORD_HERE')
    console.log('')
    process.exit(1)
  }

  setDatabasePassword(password)
}

if (require.main === module) {
  main()
}

export { setDatabasePassword }