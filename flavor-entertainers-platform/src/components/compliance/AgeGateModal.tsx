'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Calendar, Shield } from 'lucide-react';

const AGE_GATE_KEY = 'flavor_entertainers_age_verified';
const AGE_GATE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface AgeGateModalProps {
  onVerified?: () => void;
}

export function AgeGateModal({ onVerified }: AgeGateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already verified age within the last 30 days
    const checkAgeVerification = () => {
      try {
        const stored = localStorage.getItem(AGE_GATE_KEY);
        if (!stored) {
          setIsOpen(true);
          return;
        }

        const { timestamp } = JSON.parse(stored);
        const now = Date.now();
        const isExpired = now - timestamp > AGE_GATE_DURATION;

        if (isExpired) {
          localStorage.removeItem(AGE_GATE_KEY);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error checking age verification:', error);
        setIsOpen(true);
      }
    };

    checkAgeVerification();
  }, []);

  const handleVerifyAge = async () => {
    setIsLoading(true);

    try {
      // Store verification with timestamp
      const verification = {
        timestamp: Date.now(),
        verified: true,
      };
      localStorage.setItem(AGE_GATE_KEY, JSON.stringify(verification));

      setIsOpen(false);
      onVerified?.();
    } catch (error) {
      console.error('Error storing age verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    // Redirect away from the site
    window.location.href = 'https://www.google.com';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            Age Verification Required
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-semibold">18+ Content Warning</span>
              </div>
              <p className="text-sm">
                This website contains adult entertainment content and is restricted to persons 18 years of age or older.
              </p>
            </div>

            <div className="text-left space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <Calendar className="h-4 w-4 mt-0.5 mr-2 text-blue-500" />
                <span>You must be at least 18 years old to access this content</span>
              </div>
              <div className="flex items-start">
                <Shield className="h-4 w-4 mt-0.5 mr-2 text-blue-500" />
                <span>All services are provided by consenting adult entertainers</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
              <p className="font-medium mb-1">Privacy Notice:</p>
              <p>
                By clicking "I am 18 or older", you confirm your age and consent to viewing adult content.
                This verification is stored locally and expires after 30 days for your privacy.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleExit}
            className="w-full sm:w-auto text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            I am under 18 - Exit
          </Button>
          <Button
            onClick={handleVerifyAge}
            disabled={isLoading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? 'Verifying...' : 'I am 18 or older - Enter'}
          </Button>
        </DialogFooter>

        <div className="text-xs text-center text-gray-500 mt-4 border-t pt-4">
          <p>
            By entering this site, you agree to our{' '}
            <a href="/legal/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}