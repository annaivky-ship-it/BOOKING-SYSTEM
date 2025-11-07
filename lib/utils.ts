import { type ClassValue, clsx } from 'clsx';
import { format, utcToZonedTime } from 'date-fns-tz';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format date for Australia/Perth timezone
 */
export function formatDateAU(
  date: Date | string,
  formatStr: string = 'PPpp'
): string {
  const timezone = 'Australia/Perth';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    logger.warn('Invalid date provided to formatDateAU', { date });
    return 'Invalid date';
  }

  const zonedDate = utcToZonedTime(dateObj, timezone);
  return format(zonedDate, formatStr, { timeZone: timezone });
}

/**
 * Check if user is blacklisted
 */
export async function isBlacklisted(
  supabase: SupabaseClient,
  email?: string | null,
  phone?: string | null
): Promise<boolean> {
  if (!email && !phone) return false;

  try {
    const conditions: string[] = [];
    if (email) conditions.push(`email.eq.${email}`);
    if (phone) conditions.push(`phone.eq.${phone}`);

    const { data, error } = await supabase
      .from('blacklist')
      .select('id')
      .or(conditions.join(','))
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.dbError('blacklist check', 'blacklist', error as Error);
      // Fail open: if check fails, allow the action (log for review)
      return false;
    }

    return !!data;
  } catch (error) {
    logger.error('Blacklist check exception', error as Error);
    return false;
  }
}

/**
 * Check if user has valid vetting
 */
export async function hasValidVetting(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  if (!userId) {
    logger.warn('hasValidVetting called without userId');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('vetting_applications')
      .select('id, status, id_expiry_date')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .maybeSingle();

    if (error) {
      logger.dbError('vetting check', 'vetting_applications', error as Error);
      return false;
    }

    if (!data) return false;

    // Check if not expired
    const expiryDate = new Date(data.id_expiry_date);
    const today = new Date();

    const isValid = expiryDate > today;

    if (!isValid) {
      logger.info('Vetting expired for user', { userId, expiryDate: data.id_expiry_date });
    }

    return isValid;
  } catch (error) {
    logger.error('Vetting check exception', error as Error, { userId });
    return false;
  }
}

/**
 * Generate storage URL for private files
 */
export function getStorageUrl(bucket: string, path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    logger.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    throw new Error('Supabase URL not configured');
  }
  return `${baseUrl}/storage/v1/object/${bucket}/${path}`;
}

/**
 * Sanitize phone number to Australian format
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';

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
  if (length < 1 || length > 32) {
    throw new Error('ID length must be between 1 and 32');
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  // Use crypto for better randomness if available
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else if (typeof require !== 'undefined') {
    // Node.js environment
    const crypto = require('crypto');
    const array = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return result;
}

/**
 * Calculate booking duration in hours
 */
export function calculateBookingDuration(
  startTime: string,
  endTime: string
): number {
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error('Invalid time format. Expected HH:MM');
  }

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight bookings
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  const durationHours = (endMinutes - startMinutes) / 60;

  if (durationHours <= 0) {
    throw new Error('End time must be after start time');
  }

  return durationHours;
}

/**
 * Validate file type for uploads
 */
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  if (!fileName || !allowedTypes || allowedTypes.length === 0) {
    return false;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Get file size limit in bytes
 */
export function getFileSizeLimit(type: 'image' | 'document'): number {
  return type === 'image'
    ? 5 * 1024 * 1024   // 5MB for images
    : 10 * 1024 * 1024; // 10MB for documents
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Australian phone number
 */
export function isValidAustralianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // Australian mobile numbers: 04xx xxx xxx or +614xx xxx xxx
  // Australian landline: 0x xxxx xxxx or +61x xxxx xxxx
  const mobileRegex = /^(?:\+?61|0)4\d{8}$/;
  const landlineRegex = /^(?:\+?61|0)[2-9]\d{8}$/;

  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        logger.error(`Operation failed after ${maxAttempts} attempts`, lastError);
        throw lastError;
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message,
      });

      await sleep(delay);
    }
  }

  throw lastError!;
}
