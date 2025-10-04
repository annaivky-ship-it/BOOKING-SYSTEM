'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface BookingData {
  performerId: string;
  service: string;
  eventDate: string;
  eventAddress: string;
  duration: number;
  guestCount?: number;
  specialRequirements?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  termsAccepted?: boolean;
  consentConfirmed?: boolean;
  canProceed?: boolean;
  bookingId?: string;
}

export interface BookingQuote {
  baseAmount: number;
  depositAmount: number;
  depositPercent: number;
  referralAmount?: number;
  referralPercent?: number;
  totalAmount: number;
  currency: string;
}

interface UseBookingReturn {
  bookingData: Partial<BookingData>;
  quote: BookingQuote | null;
  isLoading: boolean;
  error: string | null;
  updateBookingData: (data: Partial<BookingData>) => void;
  calculateQuote: (data: BookingData) => Promise<BookingQuote | null>;
  submitBooking: (data: BookingData) => Promise<{ bookingId: string; reference: string } | null>;
  submitPayment: (paymentData: PaymentSubmissionData) => Promise<boolean>;
  checkBlacklist: (email: string, phone?: string) => Promise<boolean>;
  reset: () => void;
}

export interface PaymentSubmissionData {
  bookingId: string;
  paymentAmount: number;
  paymentReference: string;
  receiptUrl?: string;
  paymentMethod: 'payid' | 'bank_transfer';
  transactionId?: string;
  payerName: string;
  payerContact: string;
}

export function useBooking(): UseBookingReturn {
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
    setError(null);
  }, []);

  const calculateQuote = useCallback(async (data: BookingData): Promise<BookingQuote | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings/calculate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate quote');
      }

      const quoteData = await response.json();
      setQuote(quoteData);
      return quoteData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate quote';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkBlacklist = useCallback(async (email: string, phone?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/vetting/check-blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        throw new Error('Failed to check blacklist');
      }

      const { isBlacklisted, reason } = await response.json();

      if (isBlacklisted) {
        setError(`Booking cannot be processed: ${reason}`);
        toast.error('This client is currently unable to make bookings');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Blacklist check failed:', err);
      // Don't block booking if blacklist check fails
      return false;
    }
  }, []);

  const submitBooking = useCallback(async (data: BookingData): Promise<{ bookingId: string; reference: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // First check blacklist
      const isBlacklisted = await checkBlacklist(data.contactEmail, data.contactPhone);
      if (isBlacklisted) {
        return null;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit booking');
      }

      const result = await response.json();

      // Success - clear form data
      setBookingData({});
      setQuote(null);

      toast.success('Booking submitted successfully!');

      return {
        bookingId: result.id,
        reference: result.booking_reference,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit booking';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkBlacklist]);

  const submitPayment = useCallback(async (paymentData: PaymentSubmissionData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/payid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit payment');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Payment submitted successfully! You will receive confirmation shortly.');
        return true;
      } else {
        throw new Error('Payment submission failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit payment';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBookingData({});
    setQuote(null);
    setError(null);
  }, []);

  return {
    bookingData,
    quote,
    isLoading,
    error,
    updateBookingData,
    calculateQuote,
    submitBooking,
    submitPayment,
    checkBlacklist,
    reset,
  };
}

// Hook for managing booking form validation
export function useBookingValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = useCallback((step: string, data: Partial<BookingData>): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'service':
        if (!data.performerId) newErrors.performerId = 'Please select a performer';
        if (!data.service) newErrors.service = 'Please select a service';
        break;

      case 'details':
        if (!data.eventDate) newErrors.eventDate = 'Event date is required';
        if (!data.eventAddress) newErrors.eventAddress = 'Event address is required';
        if (!data.duration || data.duration < 1) newErrors.duration = 'Duration must be at least 1 hour';
        if (!data.contactName) newErrors.contactName = 'Contact name is required';
        if (!data.contactPhone) newErrors.contactPhone = 'Contact phone is required';
        if (!data.contactEmail) newErrors.contactEmail = 'Contact email is required';

        // Validate email format
        if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
          newErrors.contactEmail = 'Please enter a valid email address';
        }

        // Validate phone format (Australian)
        if (data.contactPhone && !/^(\+61|0)[2-9]\d{8}$/.test(data.contactPhone.replace(/\s/g, ''))) {
          newErrors.contactPhone = 'Please enter a valid Australian phone number';
        }

        // Validate future date
        if (data.eventDate && new Date(data.eventDate) <= new Date()) {
          newErrors.eventDate = 'Event date must be in the future';
        }
        break;

      case 'review':
        // All previous validations should pass
        const serviceValid = validateStep('service', data);
        const detailsValid = validateStep('details', data);
        if (!serviceValid || !detailsValid) {
          newErrors.general = 'Please complete all required fields';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateStep,
    clearErrors,
    clearFieldError,
  };
}