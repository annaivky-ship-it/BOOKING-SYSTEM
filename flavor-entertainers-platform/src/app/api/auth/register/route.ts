import { NextRequest, NextResponse } from 'next/server'
import { userRegistrationSchema } from '@/lib/validators'
import { db } from '@/lib/db'
import { createSuccessResponse, createErrorResponse, createAuditLog, getClientIpAddress } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = userRegistrationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Invalid input data', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    const { email, role, phone, whatsapp, legal_name } = validation.data
    const ipAddress = getClientIpAddress(request)

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await db
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser && !existingUserError) {
      return NextResponse.json(
        createErrorResponse('User with this email already exists', 'USER_EXISTS'),
        { status: 409 }
      )
    }

    // Create user
    const { data: user, error: userError } = await db
      .from('users')
      .insert({
        email,
        role,
        phone,
        whatsapp,
        legal_name
      })
      .select()
      .single()

    if (userError || !user) {
      throw new Error(userError?.message || 'Failed to create user')
    }

    // Create audit log
    const auditData = createAuditLog(
      'AUTH',
      'USER_REGISTRATION',
      {
        user_id: user.id,
        role,
        registration_method: 'email'
      },
      undefined,
      undefined,
      undefined,
      email,
      ipAddress
    )

    const { error: auditError } = await db
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

    // Return user without sensitive data
    const { ...safeUser } = user

    return NextResponse.json(
      createSuccessResponse(safeUser, 'User registered successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    )
  }
}