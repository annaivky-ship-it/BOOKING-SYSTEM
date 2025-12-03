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

    // Build query for applications
    let applicationsQuery = db
      .from('vetting_applications')
      .select('*, client:users!vetting_applications_client_id_fkey(id, email, phone, legal_name, created_at)')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (status) {
      applicationsQuery = applicationsQuery.eq('status', status)
    }

    // Build count query
    let countQuery = db
      .from('vetting_applications')
      .select('*', { count: 'exact', head: true })

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    // Execute queries in parallel
    const [applicationsResult, countResult] = await Promise.all([
      applicationsQuery,
      countQuery
    ])

    if (applicationsResult.error) {
      throw new Error(applicationsResult.error.message)
    }

    if (countResult.error) {
      throw new Error(countResult.error.message)
    }

    const applications = applicationsResult.data || []
    const total = countResult.count || 0

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
    const { data: client, error: clientError } = await db
      .from('users')
      .select('*')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
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
    const { data: existingApplication, error: existingError } = await db
      .from('vetting_applications')
      .select('*')
      .eq('client_id', client_id)
      .eq('status', 'SUBMITTED')
      .single()

    if (existingApplication && !existingError) {
      return NextResponse.json(
        createErrorResponse('You already have a pending vetting application', 'APPLICATION_EXISTS'),
        { status: 409 }
      )
    }

    // Create vetting application
    const { data: application, error: applicationError } = await db
      .from('vetting_applications')
      .insert({
        client_id,
        ...applicationData,
        file_id,
        ip_address: ipAddress,
        status: 'SUBMITTED'
      })
      .select('*, client:users!vetting_applications_client_id_fkey(id, email, phone, legal_name)')
      .single()

    if (applicationError || !application) {
      throw new Error(applicationError?.message || 'Failed to create vetting application')
    }

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

    const { error: auditError } = await db
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

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