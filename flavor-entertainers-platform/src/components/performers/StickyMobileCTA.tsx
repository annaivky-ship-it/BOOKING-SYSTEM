'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, MessageCircle, Phone, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyMobileCTAProps {
  performerName: string;
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  baseRate?: number;
  onBookNow: () => void;
  onMessage?: () => void;
  onCall?: () => void;
  className?: string;
  showOnMobileOnly?: boolean;
}

export function StickyMobileCTA({
  performerName,
  isAvailable,
  rating,
  reviewCount,
  baseRate,
  onBookNow,
  onMessage,
  onCall,
  className,
  showOnMobileOnly = true,
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY;

      // Show CTA when user scrolls down past 300px or when scrolling up
      setIsVisible(currentScrollY > 300 || isScrollingUp);
      setIsScrollingUp(isScrollingUp);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg',
            showOnMobileOnly && 'lg:hidden',
            className
          )}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Performer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{performerName}</h3>
                  {isAvailable && (
                    <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5">
                      <Zap className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600">
                  {rating && reviewCount && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{rating.toFixed(1)} ({reviewCount})</span>
                    </div>
                  )}
                  {baseRate && (
                    <span className="font-medium text-gray-900">
                      From ${baseRate}/hr
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onMessage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onMessage}
                    className="p-2 h-9 w-9"
                    aria-label="Send message"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}

                {onCall && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCall}
                    className="p-2 h-9 w-9"
                    aria-label="Call now"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  onClick={onBookNow}
                  size="sm"
                  className={cn(
                    'px-4 h-9 font-medium min-w-[80px]',
                    isAvailable
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  )}
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {isAvailable ? 'Book Now' : 'Book Later'}
                </Button>
              </div>
            </div>
          </div>

          {/* Animated indicator for availability */}
          {isAvailable && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="h-1 bg-gradient-to-r from-green-400 to-green-600"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating action button variant for desktop
export function FloatingBookingButton({
  onBookNow,
  isAvailable,
  className,
}: {
  onBookNow: () => void;
  isAvailable: boolean;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={cn(
            'fixed bottom-6 right-6 z-50 hidden lg:block',
            className
          )}
        >
          <Button
            onClick={onBookNow}
            size="lg"
            className={cn(
              'rounded-full shadow-lg hover:shadow-xl transition-all duration-200 px-6',
              isAvailable
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            <Calendar className="h-5 w-5 mr-2" />
            {isAvailable ? 'Book Now' : 'Book Later'}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}