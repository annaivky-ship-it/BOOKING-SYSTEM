# Apply Database Migrations Manually

Your Supabase project appears to be paused or the direct connection is not available. 
Let's apply the migrations manually through the Supabase SQL Editor.

## Step 1: Unpause Your Supabase Project (if needed)

1. Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp
2. If you see a "Project is paused" message, click **Restore project** or **Unpause**
3. Wait for the project to become active (may take 1-2 minutes)

## Step 2: Open SQL Editor

Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new

## Step 3: Copy and Run the Consolidated Schema

1. Open the file: `supabase/migrations/CONSOLIDATED_SCHEMA.sql`
2. Copy ALL the content
3. Paste it into the SQL Editor
4. Click **RUN** button

Alternatively, run each migration file in order:

### Migration Order:
1. `001_initial_schema.sql` - Core tables and RLS policies
2. `002_services_system.sql` - Services catalog
3. `003_do_not_serve_system.sql` - Blacklist functionality
4. `004_twilio_payid_integration.sql` - Payment & messaging
5. `005_comprehensive_platform_update.sql` - Platform updates
6. `20250923000003_add_payid_tables.sql` - PayID tables

## Step 4: Verify Tables Were Created

1. Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/editor
2. You should see these tables:
   - users
   - performers
   - bookings
   - services
   - payments
   - do_not_serve_list
   - and more...

## Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/editor
- **Project Dashboard**: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp

## After Migrations Are Applied

Come back and run:
```bash
cd flavor-entertainers-platform
npx vercel --prod
```
