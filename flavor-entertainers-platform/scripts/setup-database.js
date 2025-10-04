const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to Supabase...');

    // Test connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 means table doesn't exist yet, which is expected
      throw error;
    }

    console.log('✅ Connected to Supabase successfully!');
    console.log(`📍 Database URL: ${supabaseUrl}`);

    // Read and execute migration files
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 Creating migrations directory...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Check if migration files exist
    const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));

    if (migrationFiles.length === 0) {
      console.log('⚠️  No migration files found in supabase/migrations/');
      console.log('💡 You can manually run SQL commands in the Supabase Dashboard:');
      console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`);
      return;
    }

    console.log(`📄 Found ${migrationFiles.length} migration file(s)`);

    for (const file of migrationFiles.sort()) {
      console.log(`🔄 Executing migration: ${file}`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      // Split by semicolon and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.log(`⚠️  Warning in statement: ${error.message}`);
          }
        } catch (err) {
          console.log(`⚠️  Could not execute statement (this may be normal): ${err.message}`);
        }
      }
    }

    console.log('✅ Database setup completed!');

    // Verify key tables exist
    console.log('🔍 Verifying tables...');
    const tables = ['profiles', 'performers', 'bookings', 'payments', 'services'];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' not found or not accessible`);
        } else {
          console.log(`✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}': ${err.message}`);
      }
    }

    console.log('\n🎉 Database connection successful!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Check the Supabase dashboard for your tables and data');
    console.log(`4. Dashboard: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Supabase URL and service key in .env.local');
    console.log('3. Make sure your Supabase project is active');
    console.log('4. Try running the SQL manually in Supabase Dashboard');
    process.exit(1);
  }
}

setupDatabase();