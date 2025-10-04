'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  Info,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { BookingData, BookingQuote } from '@/hooks/useBooking';
import { format } from 'date-fns';

interface ReviewQuoteStepProps {
  performer: any;
  bookingData: Partial<BookingData>;
  quote: BookingQuote | null;
  onDataChange: (data: Partial<BookingData>) => void;
}

export function ReviewQuoteStep({
  performer,
  bookingData,
  quote,
  onDataChange
}: ReviewQuoteStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Performer Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{performer.stage_name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{performer.rating?.toFixed(1) || 'New'}</span>
                {performer.total_reviews > 0 && (
                  <span>({performer.total_reviews} reviews)</span>
                )}
                {performer.verified && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700 ml-2">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-pink-500 mt-0.5" />
                <div>
                  <p className="font-medium">Selected Service</p>
                  <p className="text-muted-foreground">{bookingData.service}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground">
                    {bookingData.eventDate ? formatDateTime(bookingData.eventDate) : 'Not selected'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-muted-foreground">{bookingData.duration} hours</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground text-sm">{bookingData.eventAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-muted-foreground">{bookingData.contactName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{bookingData.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{bookingData.contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          {bookingData.specialRequirements && (
            <>
              <Separator />
              <div>
                <p className="font-medium mb-2">Special Requirements</p>
                <p className="text-muted-foreground text-sm bg-gray-50 p-3 rounded">
                  {bookingData.specialRequirements}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quote Breakdown */}
      {quote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Quote Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">{formatCurrency(quote.baseAmount)}</span>
              </div>

              {quote.referralAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Referral Fee ({quote.referralPercent}%)
                  </span>
                  <span className="font-medium">{formatCurrency(quote.referralAmount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount</span>
                <span>{formatCurrency(quote.totalAmount)}</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-blue-900">Deposit Required</p>
                    <p className="text-sm text-blue-700">
                      {quote.depositPercent}% of total amount
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(quote.depositAmount)}
                    </p>
                    <p className="text-sm text-blue-700">Due now via PayID</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-green-900">Remaining Balance</p>
                    <p className="text-sm text-green-700">Due on completion</p>
                  </div>
                  <div className="text-xl font-bold text-green-900">
                    {formatCurrency(quote.totalAmount - quote.depositAmount)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <p className="font-medium">Booking Terms & Conditions</p>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>Deposit is required to confirm booking and is non-refundable</li>
              <li>Remaining balance is due upon completion of service</li>
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>Venue must be safe and appropriate for the selected service</li>
              <li>All parties must respect performer boundaries and professional standards</li>
              <li>Client must be present for the entire duration of the booking</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Consent & Terms */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            Consent & Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a
                  href="/legal/terms"
                  target="_blank"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/legal/privacy"
                  target="_blank"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Privacy Policy
                </a>.
                I understand that all services are provided by consenting adults and that
                I am responsible for ensuring the venue is appropriate and safe.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consentConfirmed}
                onCheckedChange={(checked) => setConsentConfirmed(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                I confirm that I am at least 18 years old and understand that this booking
                is for adult entertainment services. I agree to respect all performer boundaries,
                maintain appropriate behavior, and understand that any inappropriate conduct
                will result in immediate termination of services without refund.
              </label>
            </div>
          </div>

          {(!termsAccepted || !consentConfirmed) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You must accept all terms and confirm your consent before proceeding with the booking.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Update parent component with consent status */}
      {React.useEffect(() => {
        onDataChange({
          termsAccepted,
          consentConfirmed,
          canProceed: termsAccepted && consentConfirmed
        });
      }, [termsAccepted, consentConfirmed, onDataChange])}
    </div>
  );
}