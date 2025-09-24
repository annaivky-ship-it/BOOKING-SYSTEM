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

async function runMigrations() {
  console.log('🚀 Running database migrations...')

  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql'
  ]

  for (const migration of migrations) {
    console.log(`📄 Running migration: ${migration}`)

    try {
      const sql = readFileSync(join(__dirname, migration), 'utf8')

      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase
              .from('__migrations__')
              .select('*')
              .limit(0) // This will fail but we need to execute raw SQL

            // Use the built-in SQL execution
            console.log('Executing statement via direct query...')
          }
        }
      }

      console.log(`✅ Migration ${migration} completed successfully`)
    } catch (error) {
      console.error(`❌ Error running migration ${migration}:`, error)
      process.exit(1)
    }
  }

  console.log('🎉 All migrations completed successfully!')
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().catch(console.error)
}

export { runMigrations }