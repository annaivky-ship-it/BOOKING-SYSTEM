'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle, Clock, CreditCard, FileText, User } from 'lucide-react';

export interface BookingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface BookingStepperProps {
  steps: BookingStep[];
  currentStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
}

export function BookingStepper({
  steps,
  currentStep,
  className,
  orientation = 'horizontal',
  showConnectors = true,
}: BookingStepperProps) {
  const getStepStatus = (stepIndex: number): BookingStep['status'] => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepStyles = (status: BookingStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          container: 'text-green-600',
          circle: 'bg-green-100 border-green-500 text-green-600',
          connector: 'bg-green-500',
        };
      case 'current':
        return {
          container: 'text-blue-600',
          circle: 'bg-blue-100 border-blue-500 text-blue-600 ring-4 ring-blue-100',
          connector: 'bg-gray-300',
        };
      case 'error':
        return {
          container: 'text-red-600',
          circle: 'bg-red-100 border-red-500 text-red-600',
          connector: 'bg-gray-300',
        };
      default:
        return {
          container: 'text-gray-400',
          circle: 'bg-gray-100 border-gray-300 text-gray-400',
          connector: 'bg-gray-300',
        };
    }
  };

  const renderStepIcon = (step: BookingStep, status: BookingStep['status']) => {
    if (status === 'completed') {
      return <Check className="h-4 w-4" />;
    }
    return step.icon;
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const styles = getStepStyles(status);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start">
                <div className="relative flex items-center justify-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                      styles.circle
                    )}
                  >
                    {renderStepIcon(step, status)}
                  </div>
                  {!isLast && showConnectors && (
                    <div
                      className={cn(
                        'absolute top-10 left-1/2 w-0.5 h-8 -translate-x-px transition-all duration-200',
                        styles.connector
                      )}
                    />
                  )}
                </div>
                <div className={cn('ml-4 min-w-0 flex-1', styles.container)}>
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const styles = getStepStyles(status);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                  styles.circle
                )}
              >
                {renderStepIcon(step, status)}
              </div>
              <div className={cn('mt-2', styles.container)}>
                <h3 className="text-xs font-medium">{step.title}</h3>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {!isLast && showConnectors && (
              <div className="flex-1 mx-2 sm:mx-4">
                <div
                  className={cn(
                    'h-0.5 w-full transition-all duration-200',
                    styles.connector
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Predefined booking steps
export const defaultBookingSteps: Omit<BookingStep, 'status'>[] = [
  {
    id: 'service',
    title: 'Select Service',
    description: 'Choose your entertainment service',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: 'details',
    title: 'Event Details',
    description: 'Date, time, and location',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'review',
    title: 'Review & Quote',
    description: 'Confirm booking details',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'PayID deposit required',
    icon: <CreditCard className="h-4 w-4" />,
  },
];

// Hook for managing booking progress
export function useBookingProgress(initialStep = 0) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const nextStep = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const markStepCompleted = (step: number) => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
  };

  const resetProgress = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  return {
    currentStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    markStepCompleted,
    resetProgress,
  };
}