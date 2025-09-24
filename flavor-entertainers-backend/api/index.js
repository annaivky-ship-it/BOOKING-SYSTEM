// Vercel Serverless Function for Flavor Entertainers API
let app

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    // Initialize Fastify app if not already done
    if (!app) {
      // Set default environment variables for Vercel
      process.env.NODE_ENV = process.env.NODE_ENV || 'production'
      process.env.PORT = process.env.PORT || '3000'

      // Generate JWT secret if not provided
      if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = require('crypto').randomBytes(64).toString('base64')
      }

      // Fix malformed URLs and set correct environment variables
      let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://rpldkrstlqdlolbhbylp.supabase.co'
      // Fix double https: issue
      if (supabaseUrl.startsWith('https:https://')) {
        supabaseUrl = supabaseUrl.replace('https:https://', 'https://')
      }
      process.env.SUPABASE_URL = supabaseUrl
      process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbGRrcnN0bHFkbG9sYmhieWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Njg4NTQsImV4cCI6MjA3MzA0NDg1NH0.0aBSYWQPAWerAmguhD7yWnkJc48aBlCQQ8RPzCWdoEU'
      process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

      // PayID defaults
      process.env.PAYID_BUSINESS_EMAIL = process.env.PAYID_BUSINESS_EMAIL || 'bookings@lustandlace.com.au'
      process.env.PAYID_BUSINESS_NAME = process.env.PAYID_BUSINESS_NAME || 'Flavor Entertainers'
      process.env.PAYID_BSB = process.env.PAYID_BSB || '062-000'
      process.env.PAYID_ACCOUNT_NUMBER = process.env.PAYID_ACCOUNT_NUMBER || '12345678'

      // Admin defaults
      process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'annaivk@gmail.com'
      process.env.ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || 'whatsapp:+61414461008'

      // Other defaults
      process.env.BASE_URL = process.env.BASE_URL || 'https://flavor-entertainers-backend.vercel.app'
      process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'https://lustandlace.com.au,https://app.lustandlace.com.au'
      process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '12'
      process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || '100'
      process.env.RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || '900000'
      process.env.UPLOAD_MAX_SIZE = process.env.UPLOAD_MAX_SIZE || '10485760'
      process.env.UPLOAD_ALLOWED_TYPES = process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,application/pdf'
      process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'info'

      // Log environment setup
      console.log('🔧 Environment setup:')
      console.log('- NODE_ENV:', process.env.NODE_ENV)
      console.log('- SUPABASE_URL:', process.env.SUPABASE_URL)
      console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL)
      console.log('- BASE_URL:', process.env.BASE_URL)

      // Import and build the Fastify app
      const { buildApp } = require('../apps/api/dist/index.js')
      app = await buildApp()
      await app.ready()

      console.log('✅ Fastify app initialized for Vercel')
    }

    // Handle the request using Fastify's inject method
    const response = await app.inject({
      method: req.method,
      url: req.url || '/',
      headers: req.headers,
      payload: req.body,
      query: req.query
    })

    // Set response headers
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key])
    })

    // Send response
    res.status(response.statusCode)
    res.end(response.payload)

  } catch (error) {
    console.error('❌ Serverless function error:', error)

    // Send error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}