import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Set up test environment defaults
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'silent'

// Mock environment variables for testing
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'https://test.supabase.co'
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
}
if (!process.env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = 'test-anon-key'
}
if (!process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_test'
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
}
if (!process.env.TWILIO_ACCOUNT_SID) {
  process.env.TWILIO_ACCOUNT_SID = 'test_sid'
}
if (!process.env.TWILIO_AUTH_TOKEN) {
  process.env.TWILIO_AUTH_TOKEN = 'test_token'
}
if (!process.env.TWILIO_WHATSAPP_FROM) {
  process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+61400000000'
}
if (!process.env.ADMIN_EMAIL) {
  process.env.ADMIN_EMAIL = 'admin@test.com'
}
if (!process.env.ADMIN_WHATSAPP) {
  process.env.ADMIN_WHATSAPP = 'whatsapp:+61400000001'
}
if (!process.env.BASE_URL) {
  process.env.BASE_URL = 'http://localhost:8080'
}
if (!process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS = 'http://localhost:3000'
}
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379'
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret'
}

console.log('🧪 Test environment configured')