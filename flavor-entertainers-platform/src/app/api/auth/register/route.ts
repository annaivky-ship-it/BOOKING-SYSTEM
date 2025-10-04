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
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse('User with this email already exists', 'USER_EXISTS'),
        { status: 409 }
      )
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        role,
        phone,
        whatsapp,
        legal_name
      }
    })

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

    await db.auditLog.create({
      data: auditData
    })

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