# Copy Migration SQL for Manual Application

## Step 1: Unpause Your Supabase Project

1. Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp
2. If you see "Project is paused", click **Restore** or **Unpause**
3. Wait 1-2 minutes for activation

## Step 2: Get Migration SQL

The migration file is located at:
```
flavor-entertainers-platform/supabase/migrations/CONSOLIDATED_SCHEMA.sql
```

**To view it:**
```bash
cd flavor-entertainers-platform
cat supabase/migrations/CONSOLIDATED_SCHEMA.sql
```

Or open it in a text editor:
- Windows: Open in Notepad or VS Code
- The file contains all database schema SQL (1799 lines)

## Step 3: Apply in SQL Editor

1. Open SQL Editor: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/sql/new
2. Copy ALL content from `CONSOLIDATED_SCHEMA.sql`
3. Paste into the SQL Editor
4. Click **RUN** (or press Ctrl+Enter)
5. Wait for "Success" message

## Step 4: Verify Tables Created

Go to: https://supabase.com/dashboard/project/qohyutlxwekppkrdlamp/editor

You should see these tables:
- users
- vetting_applications
- performers
- bookings
- services
- performer_services
- payments
- payment_receipts
- do_not_serve_list
- blacklist_reason_types
- whatsapp_messages
- sms_messages
- twilio_webhooks

## Alternative: Run Each Migration Separately

If the consolidated file is too large, run these files in order:

```bash
cd flavor-entertainers-platform/supabase/migrations

# Copy and run each file one by one in SQL Editor:
1. 001_initial_schema.sql
2. 002_services_system.sql
3. 003_do_not_serve_system.sql
4. 004_twilio_payid_integration.sql
5. 005_comprehensive_platform_update.sql
6. 20250923000003_add_payid_tables.sql
```

## After Migrations Are Applied

Run deployment:
```bash
cd flavor-entertainers-platform
npx vercel --prod
```
