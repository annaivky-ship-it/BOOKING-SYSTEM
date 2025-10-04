#!/usr/bin/env tsx

/**
 * Database Setup Script for Flavor Entertainers Platform
 *
 * This script sets up the database with initial data including:
 * - System settings
 * - Default services
 * - Sample admin user
 * - Initial performer profiles
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up Flavor Entertainers Database...')

  try {
    // 1. Create system settings
    console.log('📝 Creating system settings...')
    await prisma.systemSettings.upsert({
      where: { key: 'deposit_percentage' },
      update: { value: 50 },
      create: {
        key: 'deposit_percentage',
        value: 50
      }
    })

    await prisma.systemSettings.upsert({
      where: { key: 'admin_contact' },
      update: {
        value: {
          email: 'admin@lustandlace.com.au',
          whatsapp: 'whatsapp:+61470253286'
        }
      },
      create: {
        key: 'admin_contact',
        value: {
          email: 'admin@lustandlace.com.au',
          whatsapp: 'whatsapp:+61470253286'
        }
      }
    })

    await prisma.systemSettings.upsert({
      where: { key: 'payid_settings' },
      update: {
        value: {
          primary_payid: 'annaivky@gmail.com',
          account_name: 'Flavor Entertainers',
          bank_name: 'Commonwealth Bank'
        }
      },
      create: {
        key: 'payid_settings',
        value: {
          primary_payid: 'annaivky@gmail.com',
          account_name: 'Flavor Entertainers',
          bank_name: 'Commonwealth Bank'
        }
      }
    })

    // 2. Create default services
    console.log('🎭 Creating default services...')
    const services = [
      {
        category: 'WAITRESS' as const,
        name: 'Professional Waitressing',
        description: 'Professional waitressing service for events and parties',
        unit: 'PER_HOUR' as const,
        min_duration: 60,
        base_rate: 45.00
      },
      {
        category: 'STRIP' as const,
        name: 'Hot Cream Show',
        description: '15-minute intimate performance with hot cream',
        unit: 'FLAT' as const,
        min_duration: 15,
        base_rate: 400.00
      },
      {
        category: 'STRIP' as const,
        name: 'Deluxe Hot Cream',
        description: '20-minute deluxe performance with hot cream',
        unit: 'FLAT' as const,
        min_duration: 20,
        base_rate: 450.00
      },
      {
        category: 'STRIP' as const,
        name: 'Pearls Show',
        description: '25-minute performance with pearls',
        unit: 'FLAT' as const,
        min_duration: 25,
        base_rate: 500.00
      },
      {
        category: 'XXX' as const,
        name: 'Pearls Vibe Cream',
        description: '30-minute premium experience',
        unit: 'FLAT' as const,
        min_duration: 30,
        base_rate: 600.00
      },
      {
        category: 'SPECIALTY' as const,
        name: 'Custom Entertainment',
        description: 'Bespoke entertainment package',
        unit: 'PER_HOUR' as const,
        min_duration: 60,
        base_rate: 120.00
      }
    ]

    for (const service of services) {
      await prisma.service.upsert({
        where: {
          category_name: {
            category: service.category,
            name: service.name
          }
        },
        update: service,
        create: service
      })
    }

    // 3. Create admin user
    console.log('👑 Creating admin user...')
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@lustandlace.com.au' },
      update: {
        role: 'ADMIN',
        legal_name: 'System Administrator',
        phone: '+61470253286',
        whatsapp: 'whatsapp:+61470253286'
      },
      create: {
        email: 'admin@lustandlace.com.au',
        role: 'ADMIN',
        legal_name: 'System Administrator',
        phone: '+61470253286',
        whatsapp: 'whatsapp:+61470253286'
      }
    })

    // 4. Create sample performer (Anna)
    console.log('🌟 Creating sample performer...')
    const performerUser = await prisma.user.upsert({
      where: { email: 'anna.performer@lustandlace.com.au' },
      update: {
        role: 'PERFORMER',
        legal_name: 'Anna Ivky',
        phone: '+61470253286',
        whatsapp: 'whatsapp:+61470253286'
      },
      create: {
        email: 'anna.performer@lustandlace.com.au',
        role: 'PERFORMER',
        legal_name: 'Anna Ivky',
        phone: '+61470253286',
        whatsapp: 'whatsapp:+61470253286'
      }
    })

    const annaProfile = await prisma.performer.upsert({
      where: { user_id: performerUser.id },
      update: {
        stage_name: 'Anna',
        bio: 'Professional entertainer with years of experience. Available for various events and private bookings.',
        categories: ['WAITRESS', 'STRIP', 'XXX', 'SPECIALTY'],
        location_area: 'Perth, WA',
        availability_status: 'ONLINE',
        verified: true,
        rating: 4.9,
        base_rates: {
          waitressing: 45,
          hot_cream: 400,
          deluxe_cream: 450,
          pearls: 500,
          pearls_vibe: 600
        },
        media_refs: [
          'anna-profile-1.jpg',
          'anna-profile-2.jpg',
          'anna-profile-3.jpg'
        ]
      },
      create: {
        user_id: performerUser.id,
        stage_name: 'Anna',
        bio: 'Professional entertainer with years of experience. Available for various events and private bookings.',
        categories: ['WAITRESS', 'STRIP', 'XXX', 'SPECIALTY'],
        location_area: 'Perth, WA',
        availability_status: 'ONLINE',
        verified: true,
        rating: 4.9,
        base_rates: {
          waitressing: 45,
          hot_cream: 400,
          deluxe_cream: 450,
          pearls: 500,
          pearls_vibe: 600
        },
        media_refs: [
          'anna-profile-1.jpg',
          'anna-profile-2.jpg',
          'anna-profile-3.jpg'
        ]
      }
    })

    // 5. Link performer to services
    console.log('🔗 Linking performer to services...')
    const allServices = await prisma.service.findMany()

    for (const service of allServices) {
      await prisma.performerService.upsert({
        where: {
          performer_id_service_id: {
            performer_id: annaProfile.id,
            service_id: service.id
          }
        },
        update: {
          active: true,
          custom_rate: service.base_rate
        },
        create: {
          performer_id: annaProfile.id,
          service_id: service.id,
          active: true,
          custom_rate: service.base_rate
        }
      })
    }

    // 6. Create sample client
    console.log('👤 Creating sample client...')
    const clientUser = await prisma.user.upsert({
      where: { email: 'john.doe@email.com' },
      update: {
        role: 'CLIENT',
        legal_name: 'John Doe',
        phone: '+61412345678'
      },
      create: {
        email: 'john.doe@email.com',
        role: 'CLIENT',
        legal_name: 'John Doe',
        phone: '+61412345678'
      }
    })

    // 7. Add some availability for Anna
    console.log('📅 Setting up performer availability...')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const availabilitySlots = [
      { start_time: '18:00', end_time: '23:59' },
      { start_time: '19:00', end_time: '23:59' },
      { start_time: '20:00', end_time: '23:59' }
    ]

    for (let i = 0; i < 7; i++) {
      const date = new Date(tomorrow)
      date.setDate(date.getDate() + i)

      for (const slot of availabilitySlots) {
        await prisma.availability.upsert({
          where: {
            performer_id_date_start_time: {
              performer_id: annaProfile.id,
              date: date,
              start_time: slot.start_time
            }
          },
          update: {
            end_time: slot.end_time,
            is_available: true
          },
          create: {
            performer_id: annaProfile.id,
            date: date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: true
          }
        })
      }
    }

    console.log('✅ Database setup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Admin User: admin@lustandlace.com.au`)
    console.log(`- Performer: Anna (${performerUser.email})`)
    console.log(`- Services: ${services.length} created`)
    console.log(`- Client: ${clientUser.email}`)
    console.log(`- Availability: 7 days set for Anna`)

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Database setup script completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database setup script failed:', error)
      process.exit(1)
    })
}

export default main