/**
 * Environment Configuration
 * Validates and provides type-safe access to environment variables
 */

import { z } from 'zod';

// Define environment variable schema
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Twilio (optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
  ADMIN_WHATSAPP: z.string().optional(),

  // Encryption
  ENCRYPTION_KEY: z
    .string()
    .length(32, 'Encryption key must be exactly 32 characters')
    .optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Environment validation failed');
    }
    throw error;
  }
}

// Export validated config
export const config = validateEnv();

// Helper functions
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';

// Feature flags
export const features = {
  whatsappEnabled: !!(
    config.TWILIO_ACCOUNT_SID &&
    config.TWILIO_AUTH_TOKEN &&
    config.TWILIO_WHATSAPP_NUMBER
  ),
  encryptionEnabled: !!config.ENCRYPTION_KEY,
};

// Export types
export type Config = z.infer<typeof envSchema>;
