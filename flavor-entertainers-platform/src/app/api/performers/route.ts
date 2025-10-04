import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { performerFilterBackendSchema, paginationSchema, performerProfileCreateSchema } from '@/lib/validators'
import { createSuccessResponse, createErrorResponse, createAuditLog, getClientIpAddress } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination
    const paginationData = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    })

    // Parse filters
    const filterData = performerFilterBackendSchema.parse({
      category: searchParams.get('category'),
      location_area: searchParams.get('location_area'),
      availability_status: searchParams.get('availability_status'),
      verified: searchParams.get('verified')
    })

    const { page, limit } = paginationData
    const offset = (page - 1) * limit

    // Build query conditions
    const where: any = {}

    if (filterData.category) {
      where.categories = {
        has: filterData.category
      }
    }

    if (filterData.location_area) {
      where.location_area = {
        contains: filterData.location_area,
        mode: 'insensitive'
      }
    }

    if (filterData.availability_status) {
      where.availability_status = filterData.availability_status
    }

    if (filterData.verified !== undefined) {
      where.verified = filterData.verified
    }

    // Get performers with related data
    const [performers, total] = await Promise.all([
      db.performer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              whatsapp: true,
              legal_name: true,
              created_at: true
            }
          },
          services: {
            include: {
              service: true
            },
            where: {
              active: true
            }
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: [
          { verified: 'desc' },
          { rating: 'desc' },
          { created_at: 'desc' }
        ]
      }),
      db.performer.count({ where })
    ])

    return NextResponse.json(
      createSuccessResponse({
        performers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    )

  } catch (error) {
    console.error('Performers fetch error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch performers', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = performerProfileCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Invalid input data', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { user_id, ...performerData } = body
    const ipAddress = getClientIpAddress(request)

    // Check if user exists and is a performer
    const user = await db.user.findUnique({
      where: { id: user_id }
    })

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found', 'USER_NOT_FOUND'),
        { status: 404 }
      )
    }

    if (user.role !== 'PERFORMER') {
      return NextResponse.json(
        createErrorResponse('User is not a performer', 'INVALID_ROLE'),
        { status: 403 }
      )
    }

    // Check if performer profile already exists
    const existingProfile = await db.performer.findUnique({
      where: { user_id }
    })

    if (existingProfile) {
      return NextResponse.json(
        createErrorResponse('Performer profile already exists', 'PROFILE_EXISTS'),
        { status: 409 }
      )
    }

    // Create performer profile
    const performer = await db.performer.create({
      data: {
        user_id,
        ...performerData
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            whatsapp: true,
            legal_name: true
          }
        }
      }
    })

    // Create audit log
    const auditData = createAuditLog(
      'PERFORMER',
      'PROFILE_CREATED',
      {
        performer_id: performer.id,
        stage_name: performer.stage_name,
        categories: performer.categories
      },
      user_id,
      undefined,
      undefined,
      user.email,
      ipAddress
    )

    await db.auditLog.create({
      data: auditData
    })

    return NextResponse.json(
      createSuccessResponse(performer, 'Performer profile created successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Performer creation error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to create performer profile', 'CREATION_ERROR'),
      { status: 500 }
    )
  }
}