import { type ClassValue, clsx } from 'clsx';
import { format, utcToZonedTime } from 'date-fns-tz';

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format date for Australia/Perth timezone
 */
export function formatDateAU(date: Date | string, formatStr: string = 'PPpp'): string {
  const timezone = 'Australia/Perth';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  return format(zonedDate, formatStr, { timeZone: timezone });
}

/**
 * Check if user is blacklisted
 */
export async function isBlacklisted(
  supabase: any,
  email?: string,
  phone?: string
): Promise<boolean> {
  if (!email && !phone) return false;

  const { data, error } = await supabase
    .from('blacklist')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .limit(1)
    .single();

  return !!data && !error;
}

/**
 * Check if user has valid vetting
 */
export async function hasValidVetting(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('vetting_applications')
    .select('id, status, id_expiry_date')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .single();

  if (error || !data) return false;

  // Check if not expired
  const expiryDate = new Date(data.id_expiry_date);
  const today = new Date();
  return expiryDate > today;
}

/**
 * Generate storage URL for private files
 */
export function getStorageUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
}

/**
 * Sanitize phone number to Australian format
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with +61
  if (cleaned.startsWith('0')) {
    cleaned = '61' + cleaned.slice(1);
  }

  // If doesn't start with country code, add +61
  if (!cleaned.startsWith('61')) {
    cleaned = '61' + cleaned;
  }

  return '+' + cleaned;
}

/**
 * Format phone for WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const sanitized = sanitizePhone(phone);
  return `whatsapp:${sanitized}`;
}

/**
 * Generate a short, readable ID
 */
export function generateShortId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate booking duration in hours
 */
export function calculateBookingDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60;
}

/**
 * Validate file type for uploads
 */
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Get file size limit in bytes
 */
export function getFileSizeLimit(type: 'image' | 'document'): number {
  return type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for documents
}
