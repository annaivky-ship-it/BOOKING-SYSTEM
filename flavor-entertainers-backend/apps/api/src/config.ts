import { z } from 'zod'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),

  // Database
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_ANON_KEY: z.string(),

  // Payments
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),

  // Messaging
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_WHATSAPP_FROM: z.string(),

  // Admin
  ADMIN_EMAIL: z.string().email(),
  ADMIN_WHATSAPP: z.string(),

  // Application
  BASE_URL: z.string().url(),
  CORS_ORIGINS: z.string().transform(s => s.split(',')),

  // Redis
  REDIS_URL: z.string().url(),

  // File Upload
  UPLOAD_MAX_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().transform(s => s.split(',')),

  // Security
  JWT_SECRET: z.string(),
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000), // 15 minutes

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
})

export type Config = z.infer<typeof ConfigSchema>

let cachedConfig: Config | null = null

export function getConfig(): Config {
  if (!cachedConfig) {
    try {
      cachedConfig = ConfigSchema.parse(process.env)
    } catch (error) {
      console.error('❌ Invalid configuration:', error)
      process.exit(1)
    }
  }
  return cachedConfig
}

export const config = getConfig()