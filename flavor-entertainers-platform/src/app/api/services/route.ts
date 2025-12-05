import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceCreateSchema } from '@/lib/validators'
import { createSuccessResponse, createErrorResponse, createAuditLog, getClientIpAddress } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const active = searchParams.get('active')

    // Build Supabase query
    let query = db.from('services').select('*')

    if (category) {
      query = query.eq('category', category)
    }

    if (active !== null) {
      query = query.eq('active', active === 'true')
    }

    const { data: services, error: servicesError } = await query
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (servicesError) {
      throw new Error(servicesError.message)
    }

    // Note: Complex nested includes with _count are not directly supported in Supabase
    // These would need to be handled with separate queries or database views/functions
    // For now, returning basic service data

    return NextResponse.json(
      createSuccessResponse(services || [])
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
    const { data: adminUser, error: adminUserError } = await db
      .from('users')
      .select('*')
      .eq('id', actor_user_id)
      .single()

    if (adminUserError || !adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        createErrorResponse('Unauthorized - Admin access required', 'UNAUTHORIZED'),
        { status: 403 }
      )
    }

    // Create service
    const { data: service, error: serviceError } = await db
      .from('services')
      .insert(serviceData)
      .select()
      .single()

    if (serviceError || !service) {
      throw new Error(serviceError?.message || 'Failed to create service')
    }

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

    const { error: auditError } = await db
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

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