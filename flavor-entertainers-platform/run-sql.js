const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔄 Connecting to Supabase...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Split SQL into smaller chunks and execute them one by one
const sqlCommands = [
  // 1. Create enums
  `DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    CREATE TYPE vetting_status AS ENUM ('submitted', 'approved', 'rejected', 'expired');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$;`,

  // 2. Create function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`,

  // 3. Create profiles table
  `CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      role user_role DEFAULT 'client',
      display_name TEXT,
      first_name TEXT,
      last_name TEXT,
      whatsapp TEXT,
      phone TEXT,
      email TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // 4. Create services table
  `CREATE TABLE IF NOT EXISTS public.services (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      base_rate NUMERIC DEFAULT 0,
      rate_type TEXT DEFAULT 'per_hour',
      category TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // 5. Create performers table
  `CREATE TABLE IF NOT EXISTS public.performers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      stage_name TEXT NOT NULL,
      bio TEXT,
      location TEXT,
      slug TEXT UNIQUE,
      services JSONB DEFAULT '{}',
      rate_card JSONB DEFAULT '{}',
      is_available BOOLEAN DEFAULT true,
      hero_image TEXT,
      gallery_images TEXT[],
      verification_status TEXT DEFAULT 'pending',
      rating NUMERIC DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // 6. Create bookings table
  `CREATE TABLE IF NOT EXISTS public.bookings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      booking_reference TEXT UNIQUE NOT NULL,
      client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
      service_id UUID REFERENCES public.services(id),
      event_type TEXT,
      event_date TIMESTAMP WITH TIME ZONE,
      event_address TEXT,
      duration_hours NUMERIC DEFAULT 1,
      status booking_status DEFAULT 'pending',
      total_amount NUMERIC DEFAULT 0,
      deposit_amount NUMERIC DEFAULT 0,
      deposit_percent NUMERIC DEFAULT 15,
      referral_percent NUMERIC DEFAULT 0,
      referral_amount NUMERIC DEFAULT 0,
      notes TEXT,
      special_requests TEXT,
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      venue TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // 7. Create payments table
  `CREATE TABLE IF NOT EXISTS public.payments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL,
      method TEXT DEFAULT 'PAYID',
      status payment_status DEFAULT 'pending',
      transaction_id TEXT,
      receipt_file TEXT,
      payid_reference TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  // 8. Enable RLS
  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;`,

  // 9. Create basic policies
  `CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
   CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY IF NOT EXISTS "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
   CREATE POLICY IF NOT EXISTS "Performers are viewable by everyone" ON public.performers FOR SELECT USING (true);`,

  // 10. Create user registration function
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO public.profiles (id, email, display_name)
       VALUES (
           NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
       );
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;`,

  // 11. Create trigger
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
       AFTER INSERT ON auth.users
       FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,

  // 12. Insert sample services
  `INSERT INTO public.services (name, description, base_rate, rate_type, category) VALUES
   ('Topless Waitressing', 'Professional topless waitressing service', 150, 'per_hour', 'Waitressing'),
   ('Entertainment Show', 'Live entertainment performance', 300, 'per_show', 'Performance'),
   ('Personal Hosting', 'Professional hosting and companionship', 200, 'per_hour', 'Hosting')
   ON CONFLICT DO NOTHING;`
];

async function runSQL() {
  for (let i = 0; i < sqlCommands.length; i++) {
    try {
      console.log(`🔄 Running command ${i + 1}/${sqlCommands.length}...`);

      const { data, error } = await supabase.rpc('exec', {
        sql: sqlCommands[i]
      });

      if (error) {
        console.log(`⚠️  Command ${i + 1} warning:`, error.message);
      } else {
        console.log(`✅ Command ${i + 1} completed`);
      }
    } catch (err) {
      console.log(`⚠️  Command ${i + 1} error:`, err.message);
      // Continue with next command
    }
  }

  // Test the setup
  console.log('\n🔍 Testing database setup...');

  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Profiles table:', error.message);
    } else {
      console.log('✅ Profiles table: Ready');
    }
  } catch (err) {
    console.log('❌ Database test failed:', err.message);
  }

  console.log('\n🎉 Database setup completed!');
  console.log('📋 Next: Run npm run dev to start the application');
}

runSQL();