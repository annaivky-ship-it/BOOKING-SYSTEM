import CryptoJS from 'crypto-js';
import { config, features } from './config';
import { logger } from './logger';

/**
 * Encryption Utility
 * Provides AES-256 encryption for sensitive data
 */

/**
 * Encrypt sensitive data using AES-256
 */
export function encrypt(text: string): string {
  if (!features.encryptionEnabled) {
    logger.warn('Encryption requested but ENCRYPTION_KEY not configured');
    throw new Error('Encryption not available');
  }

  if (!text) {
    throw new Error('Cannot encrypt empty string');
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(text, config.ENCRYPTION_KEY!).toString();
    return encrypted;
  } catch (error) {
    logger.error('Encryption failed', error as Error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 */
export function decrypt(ciphertext: string): string {
  if (!features.encryptionEnabled) {
    logger.warn('Decryption requested but ENCRYPTION_KEY not configured');
    throw new Error('Decryption not available');
  }

  if (!ciphertext) {
    throw new Error('Cannot decrypt empty string');
  }

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, config.ENCRYPTION_KEY!);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error('Decryption produced empty result');
    }

    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', error as Error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a secure filename for storage
 */
export function generateSecureFilename(
  originalFilename: string,
  userId: string
): string {
  if (!originalFilename || !userId) {
    throw new Error('Original filename and userId are required');
  }

  const timestamp = Date.now();
  const randomString = CryptoJS.lib.WordArray.random(16).toString();
  const extension = originalFilename.split('.').pop()?.toLowerCase();

  if (!extension) {
    throw new Error('File must have an extension');
  }

  return `${userId}/${timestamp}-${randomString}.${extension}`;
}

/**
 * Hash sensitive data for comparison (one-way)
 */
export function hash(text: string): string {
  if (!text) {
    throw new Error('Cannot hash empty string');
  }

  return CryptoJS.SHA256(text).toString();
}

/**
 * Generate a random token (for password reset, etc.)
 */
export function generateToken(length: number = 32): string {
  if (length < 16 || length > 128) {
    throw new Error('Token length must be between 16 and 128');
  }

  return CryptoJS.lib.WordArray.random(length / 2).toString();
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
export function secureCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Mask sensitive data for logging (show first and last few characters)
 */
export function maskSensitive(
  value: string,
  visibleChars: number = 4
): string {
  if (!value || value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }

  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const masked = '*'.repeat(value.length - visibleChars * 2);

  return `${start}${masked}${end}`;
}
