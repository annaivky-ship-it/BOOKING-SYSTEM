import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { vettingApplicationCreateSchema, paginationSchema } from '@/lib/validators'
import { createSuccessResponse, createErrorResponse, createAuditLog, getClientIpAddress } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination
    const paginationData = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    })

    const status = searchParams.get('status')
    const { page, limit } = paginationData
    const offset = (page - 1) * limit

    // Build query conditions
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Get vetting applications
    const [applications, total] = await Promise.all([
      db.vettingApplication.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              email: true,
              phone: true,
              legal_name: true,
              created_at: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: [
          { created_at: 'desc' }
        ]
      }),
      db.vettingApplication.count({ where })
    ])

    return NextResponse.json(
      createSuccessResponse({
        applications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    )

  } catch (error) {
    console.error('Vetting applications fetch error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to fetch vetting applications', 'FETCH_ERROR'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = vettingApplicationCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Invalid input data', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { client_id, file_id } = body // These should come from authentication and file upload
    const applicationData = validation.data
    const ipAddress = getClientIpAddress(request)

    // Check if client exists
    const client = await db.user.findUnique({
      where: { id: client_id }
    })

    if (!client) {
      return NextResponse.json(
        createErrorResponse('Client not found', 'CLIENT_NOT_FOUND'),
        { status: 404 }
      )
    }

    if (client.role !== 'CLIENT') {
      return NextResponse.json(
        createErrorResponse('Only clients can apply for vetting', 'INVALID_ROLE'),
        { status: 403 }
      )
    }

    // Check if there's already a pending application
    const existingApplication = await db.vettingApplication.findFirst({
      where: {
        client_id,
        status: 'SUBMITTED'
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        createErrorResponse('You already have a pending vetting application', 'APPLICATION_EXISTS'),
        { status: 409 }
      )
    }

    // Create vetting application
    const application = await db.vettingApplication.create({
      data: {
        client_id,
        ...applicationData,
        file_id,
        ip_address: ipAddress,
        status: 'SUBMITTED'
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            phone: true,
            legal_name: true
          }
        }
      }
    })

    // Create audit log
    const auditData = createAuditLog(
      'VETTING',
      'APPLICATION_SUBMITTED',
      {
        application_id: application.id,
        client_id,
        event_date: application.event_date,
        event_type: application.event_type
      },
      client_id,
      undefined,
      application.id,
      client.email,
      ipAddress
    )

    await db.auditLog.create({
      data: auditData
    })

    // TODO: Send notification to admin about new vetting application

    return NextResponse.json(
      createSuccessResponse(application, 'Vetting application submitted successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Vetting application creation error:', error)
    return NextResponse.json(
      createErrorResponse('Failed to submit vetting application', 'CREATION_ERROR'),
      { status: 500 }
    )
  }
}