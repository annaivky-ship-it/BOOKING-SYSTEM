import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceCreateSchema } from '@/lib/validators'
import { createSuccessResponse, createErrorResponse, createAuditLog, getClientIpAddress } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const active = searchParams.get('active')

    // Build query conditions
    const where: any = {}

    if (category) {
      where.category = category
    }

    if (active !== null) {
      where.active = active === 'true'
    }

    const services = await db.service.findMany({
      where,
      include: {
        performer_services: {
          where: {
            active: true
          },
          include: {
            performer: {
              select: {
                id: true,
                stage_name: true,
                availability_status: true,
                verified: true
              }
            }
          }
        },
        _count: {
          select: {
            performer_services: {
              where: {
                active: true
              }
            },
            bookings: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(
      createSuccessResponse(services)
    )

  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch services', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = serviceCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Invalid input data', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { actor_user_id } = body // This should come from authentication
    const ipAddress = getClientIpAddress(request)
    const serviceData = validation.data

    // Check if admin user
    const adminUser = await db.user.findUnique({
      where: { id: actor_user_id }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        createErrorResponse('Unauthorized - Admin access required', 'UNAUTHORIZED'),
        { status: 403 }
      )
    }

    // Create service
    const service = await db.service.create({
      data: serviceData
    })

    // Create audit log
    const auditData = createAuditLog(
      'SERVICE',
      'SERVICE_CREATED',
      {
        service_id: service.id,
        name: service.name,
        category: service.category,
        base_rate: service.base_rate
      },
      actor_user_id,
      undefined,
      undefined,
      undefined,
      ipAddress
    )

    await db.auditLog.create({
      data: auditData
    })

    return NextResponse.json(
      createSuccessResponse(service, 'Service created successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to create service', 'CREATION_ERROR'),
      { status: 500 }
    )
  }
}