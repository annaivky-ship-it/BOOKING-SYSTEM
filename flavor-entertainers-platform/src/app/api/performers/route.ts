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

    // Build query for performers
    let performersQuery = db
      .from('performers')
      .select('*, user:users!performers_user_id_fkey(id, email, phone, whatsapp, legal_name, created_at)')
      .range(offset, offset + limit - 1)
      .order('verified', { ascending: false })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })

    if (filterData.category) {
      performersQuery = performersQuery.contains('categories', [filterData.category])
    }

    if (filterData.location_area) {
      performersQuery = performersQuery.ilike('location_area', `%${filterData.location_area}%`)
    }

    if (filterData.availability_status) {
      performersQuery = performersQuery.eq('availability_status', filterData.availability_status)
    }

    if (filterData.verified !== undefined) {
      performersQuery = performersQuery.eq('verified', filterData.verified)
    }

    // Build count query
    let countQuery = db
      .from('performers')
      .select('*', { count: 'exact', head: true })

    if (filterData.category) {
      countQuery = countQuery.contains('categories', [filterData.category])
    }

    if (filterData.location_area) {
      countQuery = countQuery.ilike('location_area', `%${filterData.location_area}%`)
    }

    if (filterData.availability_status) {
      countQuery = countQuery.eq('availability_status', filterData.availability_status)
    }

    if (filterData.verified !== undefined) {
      countQuery = countQuery.eq('verified', filterData.verified)
    }

    // Execute queries in parallel
    const [performersResult, countResult] = await Promise.all([
      performersQuery,
      countQuery
    ])

    if (performersResult.error) {
      throw new Error(performersResult.error.message)
    }

    if (countResult.error) {
      throw new Error(countResult.error.message)
    }

    const performers = performersResult.data || []
    const total = countResult.count || 0

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
    const { data: user, error: userError } = await db
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
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
    const { data: existingProfile, error: existingError } = await db
      .from('performers')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (existingProfile && !existingError) {
      return NextResponse.json(
        createErrorResponse('Performer profile already exists', 'PROFILE_EXISTS'),
        { status: 409 }
      )
    }

    // Create performer profile
    const { data: performer, error: performerError } = await db
      .from('performers')
      .insert({
        user_id,
        ...performerData
      })
      .select('*, user:users!performers_user_id_fkey(id, email, phone, whatsapp, legal_name)')
      .single()

    if (performerError || !performer) {
      throw new Error(performerError?.message || 'Failed to create performer profile')
    }

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

    const { error: auditError } = await db
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

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