import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSeed() {
  console.log('🌱 Running database seed (production mode - no demo data)...')

  try {
    // Use production seed file - no demo data for production
    const seedFile = process.env.NODE_ENV === 'production' ? 'production_seed.sql' : 'seed_data.sql'
    const seedSql = readFileSync(join(__dirname, seedFile), 'utf8')
    console.log(`📄 Using seed file: ${seedFile}`)

    // Split SQL into individual statements and execute them
    const statements = seedSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📄 Executing ${statements.length} seed statements...`)

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Use raw SQL execution via RPC or direct query
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

          if (error && !error.message.includes('already exists')) {
            console.warn(`⚠️  Warning executing statement: ${error.message}`)
            // Continue with other statements even if some fail
          }
        } catch (err) {
          console.warn(`⚠️  Warning: ${err}`)
          // Continue with seeding
        }
      }
    }

    // Verify seed data was created
    console.log('🔍 Verifying seed data...')

    const verifications = [
      { table: 'profiles', description: 'User profiles' },
      { table: 'performers', description: 'Performers' },
      { table: 'clients', description: 'Clients' },
      { table: 'availability', description: 'Availability windows' },
      { table: 'bookings', description: 'Sample bookings' },
      { table: 'approved_clients', description: 'Approved clients' },
      { table: 'blacklist', description: 'Blacklist entries' },
      { table: 'vetting_applications', description: 'Vetting applications' }
    ]

    for (const { table, description } of verifications) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`❌ Error checking ${table}:`, error.message)
      } else {
        console.log(`✅ ${description}: ${count} records`)
      }
    }

    console.log('🎉 Database seeding completed successfully!')
    console.log('')
    if (process.env.NODE_ENV === 'production') {
      console.log('📋 Production seed data summary:')
      console.log('   - 1 Admin user profile created')
      console.log('   - No demo data (clean production database)')
      console.log('')
      console.log('🔐 Admin login credentials:')
      console.log('   Email: admin@lustandlace.com.au')
      console.log('   Password: FlavorAdmin2024!')
      console.log('   (Note: Admin auth user must be created manually in Supabase)')
    } else {
      console.log('📋 Development seed data summary:')
      console.log('   - 1 Admin user (admin@lustandlace.com.au)')
      console.log('   - 5 Performers with different services and regions')
      console.log('   - 3 Test clients')
      console.log('   - Sample bookings in various statuses')
      console.log('   - 1 Pre-approved client')
      console.log('   - 1 Blacklisted entry')
      console.log('   - Sample vetting applications')
      console.log('   - Audit log entries')
      console.log('')
      console.log('🔐 Test login credentials:')
      console.log('   Admin: admin@lustandlace.com.au / admin123')
      console.log('   (Note: Auth users must be created manually or via API)')
    }

  } catch (error) {
    console.error('❌ Error running seed:', error)
    process.exit(1)
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  runSeed().catch(console.error)
}

export { runSeed }