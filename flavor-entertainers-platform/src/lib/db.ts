// Database client using Supabase
// Prisma is not used - we use Supabase client directly
import { createAdminClient } from './supabase';

export const db = createAdminClient();
