import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'AUD') {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'FE-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function calculateAge(birthDate: string | Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function validateABN(abn: string): boolean {
  // Remove spaces and non-digits
  const cleanABN = abn.replace(/\s/g, '').replace(/\D/g, '')

  if (cleanABN.length !== 11) return false

  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
  let sum = 0

  for (let i = 0; i < 11; i++) {
    sum += parseInt(cleanABN[i]) * weights[i]
  }

  return sum % 89 === 0
}

export function validatePayID(identifier: string): { valid: boolean; type: 'email' | 'phone' | 'abn' | null } {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(identifier)) {
    return { valid: true, type: 'email' }
  }

  // Phone validation (Australian format)
  const phoneRegex = /^(\+61|0)[2-9]\d{8}$/
  if (phoneRegex.test(identifier.replace(/\s/g, ''))) {
    return { valid: true, type: 'phone' }
  }

  // ABN validation
  if (validateABN(identifier)) {
    return { valid: true, type: 'abn' }
  }

  return { valid: false, type: null }
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

export function calculateBookingTotal(
  hourlyRate: number,
  duration: number,
  additionalFees = 0,
  discount = 0
): { subtotal: number; fees: number; discount: number; total: number } {
  const subtotal = hourlyRate * duration
  const fees = additionalFees
  const discountAmount = discount
  const total = subtotal + fees - discountAmount

  return {
    subtotal,
    fees,
    discount: discountAmount,
    total: Math.max(0, total)
  }
}

export function getBookingStatusColor(status: string): string {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    disputed: 'bg-purple-100 text-purple-800',
  }

  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
}

export function getPaymentStatusColor(status: string): string {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  }

  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
}

// Backend API utilities
export function generateReferenceCode(prefix: string, id: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${id.slice(-8)}-${timestamp}-${random}`
}

export function calculateDepositAmount(subtotal: number, depositPercent: number = 50): number {
  return Math.round((subtotal * depositPercent) / 100 * 100) / 100
}

export function calculateBalanceAmount(subtotal: number, depositAmount: number): number {
  return Math.round((subtotal - depositAmount) * 100) / 100
}

export function createAuditLog(
  eventType: string,
  action: string,
  details: Record<string, any>,
  actorUserId?: string,
  bookingId?: string,
  applicationId?: string,
  clientEmail?: string,
  ipAddress?: string
) {
  return {
    event_type: eventType,
    action,
    details,
    actor_user_id: actorUserId,
    booking_id: bookingId,
    application_id: applicationId,
    client_email: clientEmail,
    ip_address: ipAddress,
    timestamp: new Date()
  }
}

export function getClientIpAddress(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const clientIp = req.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }
  if (clientIp) {
    return clientIp
  }

  return 'unknown'
}

export function sanitizeForDatabase(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '')
}

export function validateTimeSlot(startTime: string, endTime: string): boolean {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  return endMinutes > startMinutes
}

export function isDateInFuture(dateString: string, minHoursAhead: number = 24): boolean {
  const eventDate = new Date(dateString)
  const minDate = new Date(Date.now() + minHoursAhead * 60 * 60 * 1000)
  return eventDate >= minDate
}

export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Ensure it starts with whatsapp: prefix
  if (cleaned.startsWith('+')) {
    return `whatsapp:${cleaned}`
  }
  if (cleaned.startsWith('61')) {
    return `whatsapp:+${cleaned}`
  }
  if (cleaned.startsWith('0')) {
    return `whatsapp:+61${cleaned.substring(1)}`
  }

  return `whatsapp:+${cleaned}`
}

export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length)
  }

  const masked = '*'.repeat(data.length - visibleChars)
  const visible = data.slice(-visibleChars)
  return masked + visible
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message: message || 'Operation completed successfully'
  }
}

export function createErrorResponse(message: string, code?: string, statusCode: number = 400) {
  return {
    success: false,
    error: {
      message,
      code,
      statusCode
    }
  }
}

export function validateFileUpload(file: File, allowedTypes: string[], maxSizeBytes: number): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${file.size} exceeds maximum allowed size of ${maxSizeBytes} bytes`
    }
  }

  return { valid: true }
}

export function generateSecureFileName(originalName: string, userId: string): string {
  const extension = originalName.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  return `${userId}/${timestamp}_${random}.${extension}`
}