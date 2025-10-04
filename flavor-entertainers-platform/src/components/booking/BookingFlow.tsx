'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookingStepper, defaultBookingSteps, useBookingProgress } from './BookingStepper';
import { ServiceSelectionStep } from './steps/ServiceSelectionStep';
import { EventDetailsStep } from './steps/EventDetailsStep';
import { ReviewQuoteStep } from './steps/ReviewQuoteStep';
import { PaymentStep } from './steps/PaymentStep';
import { useBooking, useBookingValidation } from '@/hooks/useBooking';
import { useWhatsAppNotify } from '@/hooks/useWhatsAppNotify';
import { createClientComponentClient } from '@/lib/supabase';
import { AlertCircle, ArrowLeft, CheckCircle, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface BookingFlowProps {
  performerId: string;
}

export function BookingFlow({ performerId }: BookingFlowProps) {
  const router = useRouter();
  const [performer, setPerformer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    resetProgress
  } = useBookingProgress();

  const {
    bookingData,
    quote,
    isLoading: bookingLoading,
    error: bookingError,
    updateBookingData,
    calculateQuote,
    submitBooking,
    submitPayment,
    reset: resetBooking
  } = useBooking();

  const {
    errors,
    validateStep,
    clearErrors,
    clearFieldError
  } = useBookingValidation();

  const { sendBookingNotification } = useWhatsAppNotify();
  const supabase = createClientComponentClient();

  // Load performer data
  useEffect(() => {
    async function loadPerformer() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('performers')
          .select(`
            *,
            profile:profiles!performers_user_id_fkey(
              display_name,
              whatsapp,
              phone,
              email
            )
          `)
          .eq('id', performerId)
          .single();

        if (error) {
          throw new Error('Performer not found');
        }

        setPerformer(data);
        updateBookingData({ performerId: data.id });
      } catch (err) {
        console.error('Error loading performer:', err);
        setError('Unable to load performer details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (performerId) {
      loadPerformer();
    }
  }, [performerId, supabase, updateBookingData]);

  // Handle step navigation
  const handleNextStep = async () => {
    const stepNames = ['service', 'details', 'review', 'payment'];
    const currentStepName = stepNames[currentStep];

    // Validate current step
    const isValid = validateStep(currentStepName, bookingData);
    if (!isValid) {
      toast.error('Please complete all required fields');
      return;
    }

    // Generate quote for review step
    if (currentStep === 1 && bookingData.service && bookingData.duration) {
      const quoteData = await calculateQuote(bookingData as any);
      if (!quoteData) {
        toast.error('Unable to calculate quote. Please try again.');
        return;
      }
    }

    nextStep();
    clearErrors();
  };

  const handlePrevStep = () => {
    prevStep();
    clearErrors();
  };

  // Handle booking submission (creates booking without payment)
  const handleSubmitBooking = async () => {
    try {
      const result = await submitBooking(bookingData as any);
      if (result) {
        // Update booking data with the booking ID for payment
        updateBookingData({ bookingId: result.bookingId });

        toast.success('Booking created! Please proceed with payment.');
        nextStep(); // Move to payment step
      }
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    }
  };

  // Handle payment submission
  const handlePaymentSubmission = async (paymentData: any) => {
    try {
      const success = await submitPayment(paymentData);
      if (success) {
        // Send notifications
        await sendBookingNotification('payment_submitted', paymentData.bookingId);

        // Redirect to confirmation page
        router.push(`/booking/confirmation/${paymentData.bookingId}`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Failed to submit payment. Please try again.');
      return false;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !performer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Performer not found'}
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Button onClick={() => router.push('/performers')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Performers
          </Button>
        </div>
      </div>
    );
  }

  const stepComponents = [
    <ServiceSelectionStep
      key="service"
      performer={performer}
      selectedService={bookingData.service}
      onServiceSelect={(service) => {
        updateBookingData({ service });
        clearFieldError('service');
      }}
      errors={errors}
    />,
    <EventDetailsStep
      key="details"
      bookingData={bookingData}
      onDataChange={(data) => {
        updateBookingData(data);
        Object.keys(data).forEach(clearFieldError);
      }}
      errors={errors}
    />,
    <ReviewQuoteStep
      key="review"
      performer={performer}
      bookingData={bookingData}
      quote={quote}
      onDataChange={updateBookingData}
    />,
    <PaymentStep
      key="payment"
      performer={performer}
      bookingData={bookingData}
      quote={quote}
      onSubmit={handlePaymentSubmission}
      isLoading={bookingLoading}
    />
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => router.push('/performers')}
          variant="ghost"
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Performers
        </Button>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
            {performer.hero_image ? (
              <Image
                src={performer.hero_image}
                alt={performer.stage_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Book {performer.stage_name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={performer.is_available ? 'default' : 'secondary'}>
                {performer.is_available ? 'Available Now' : 'Available Soon'}
              </Badge>
              {performer.verified && (
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <BookingStepper
          steps={defaultBookingSteps.map((step, index) => ({
            ...step,
            status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'pending'
          }))}
          currentStep={currentStep}
          orientation="horizontal"
          className="mb-8"
        />
      </div>

      {/* Error Display */}
      {(bookingError || Object.keys(errors).length > 0) && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {bookingError || 'Please fix the errors below to continue'}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {defaultBookingSteps[currentStep]?.icon}
            {defaultBookingSteps[currentStep]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stepComponents[currentStep]}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {currentStep > 0 && (
            <Button
              onClick={handlePrevStep}
              variant="outline"
              disabled={bookingLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep < defaultBookingSteps.length - 1 ? (
            currentStep === 2 ? ( // Review step - create booking
              <Button
                onClick={handleSubmitBooking}
                disabled={bookingLoading || !quote || !bookingData.termsAccepted || !bookingData.consentConfirmed}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                size="lg"
              >
                {bookingLoading ? 'Creating Booking...' : 'Create Booking & Proceed to Payment'}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
                disabled={bookingLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Continue
                <Calendar className="ml-2 h-4 w-4" />
              </Button>
            )
          ) : null}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Need help? Contact our support team at{' '}
          <a href="mailto:support@lustandlace.com.au" className="text-blue-600 hover:underline">
            support@lustandlace.com.au
          </a>
        </p>
      </div>
    </div>
  );
}