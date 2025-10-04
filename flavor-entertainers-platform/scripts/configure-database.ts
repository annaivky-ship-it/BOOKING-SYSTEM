#!/usr/bin/env tsx

/**
 * Database Configuration Script for Flavor Entertainers Platform
 *
 * This script helps you configure the database connection with the correct password
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password?: string
  supabaseUrl: string
  projectRef: string
}

function extractConfigFromEnv(): DatabaseConfig {
  const envPath = join(process.cwd(), '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')

  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1] || ''
  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1] || ''

  return {
    host: `aws-0-ap-southeast-1.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    username: `postgres.${projectRef}`,
    supabaseUrl,
    projectRef
  }
}

function updateEnvironmentFile(password: string) {
  const envPath = join(process.cwd(), '.env.local')
  let envContent = readFileSync(envPath, 'utf-8')

  const config = extractConfigFromEnv()

  const databaseUrl = `postgresql://${config.username}:${password}@${config.host}:6543/${config.database}?pgbouncer=true&connection_limit=1`
  const directUrl = `postgresql://${config.username}:${password}@${config.host}:5432/${config.database}`

  // Update DATABASE_URL
  envContent = envContent.replace(
    /DATABASE_URL=.*/,
    `DATABASE_URL=${databaseUrl}`
  )

  // Update DIRECT_URL
  envContent = envContent.replace(
    /DIRECT_URL=.*/,
    `DIRECT_URL=${directUrl}`
  )

  writeFileSync(envPath, envContent)

  console.log('✅ Environment file updated with database credentials')
  return { databaseUrl, directUrl }
}

async function testConnection(password: string): Promise<boolean> {
  try {
    console.log('🔍 Testing database connection...')

    updateEnvironmentFile(password)

    // Create a new Prisma client with the updated environment
    process.env.DATABASE_URL = process.env.DATABASE_URL?.replace('your-database-password', password)
    process.env.DIRECT_URL = process.env.DIRECT_URL?.replace('your-database-password', password)

    const prisma = new PrismaClient()

    // Test the connection
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1 as test`
    await prisma.$disconnect()

    console.log('✅ Database connection successful!')
    return true

  } catch (error) {
    console.log('❌ Database connection failed:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

async function getPasswordFromUser(): Promise<string> {
  console.log('\n🔐 Database Password Required')
  console.log('=' * 50)
  console.log('To get your Supabase database password:')
  console.log('1. Go to: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu')
  console.log('2. Navigate to: Settings → Database')
  console.log('3. Copy the password (or reset it if needed)')
  console.log('4. Enter it below:')
  console.log('')

  // For now, return a placeholder - in a real scenario, you'd use readline
  return 'your-database-password'
}

async function main() {
  console.log('🚀 Configuring Flavor Entertainers Database Connection')
  console.log('=' * 60)

  const config = extractConfigFromEnv()

  console.log('📋 Current Configuration:')
  console.log(`   Project: ${config.projectRef}`)
  console.log(`   Host: ${config.host}`)
  console.log(`   Database: ${config.database}`)
  console.log(`   Username: ${config.username}`)
  console.log('')

  // Check if password is already set
  const envPath = join(process.cwd(), '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')

  if (envContent.includes('your-database-password')) {
    console.log('⚠️  Database password not configured yet')

    // Create a instructions file for manual configuration
    const instructions = `
# Database Configuration Instructions

Your Supabase project is: fmezpefpletmnthrmupu

## Step 1: Get Your Database Password
1. Go to: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu
2. Navigate to: Settings → Database
3. Copy the password (or reset it if needed)

## Step 2: Update Environment File
Replace 'your-database-password' in .env.local with your actual password:

DATABASE_URL=postgresql://postgres.fmezpefpletmnthrmupu:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.fmezpefpletmnthrmupu:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

## Step 3: Test Connection
npm run db:push

## Step 4: Seed Database
npm run db:seed

## Step 5: Test API
npm run test:api
`

    writeFileSync(join(process.cwd(), 'DATABASE_SETUP_INSTRUCTIONS.md'), instructions)

    console.log('📄 Created DATABASE_SETUP_INSTRUCTIONS.md with detailed steps')
    console.log('')
    console.log('🔧 Manual Configuration Required:')
    console.log('   1. Get password from Supabase dashboard')
    console.log('   2. Update .env.local file')
    console.log('   3. Run: npm run db:push')
    console.log('   4. Run: npm run db:seed')

  } else {
    console.log('✅ Database password appears to be configured')
    console.log('🧪 Testing connection...')

    try {
      const prisma = new PrismaClient()
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1 as test`
      await prisma.$disconnect()

      console.log('✅ Database connection successful!')
      console.log('🎯 Ready to deploy schema and seed data')

    } catch (error) {
      console.log('❌ Database connection failed')
      console.log('Please check your password in .env.local')
    }
  }

  console.log('\n🎉 Database configuration script completed!')
}

if (require.main === module) {
  main()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Configuration failed:', error)
      process.exit(1)
    })
}

export default main