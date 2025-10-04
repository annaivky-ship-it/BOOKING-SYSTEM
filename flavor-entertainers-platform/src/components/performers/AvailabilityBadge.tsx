'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityBadgeProps {
  isAvailable: boolean;
  lastSeen?: string;
  nextAvailable?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  variant?: 'default' | 'pulse' | 'minimal';
}

export function AvailabilityBadge({
  isAvailable,
  lastSeen,
  nextAvailable,
  className,
  size = 'md',
  showIcon = true,
  showText = true,
  variant = 'default',
}: AvailabilityBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const getAvailabilityContent = () => {
    if (isAvailable) {
      return {
        text: 'Available Now',
        icon: Zap,
        className: variant === 'pulse'
          ? 'bg-green-500 text-white animate-pulse'
          : 'bg-green-100 text-green-800 border-green-200',
      };
    }

    if (nextAvailable) {
      return {
        text: `Next: ${nextAvailable}`,
        icon: Calendar,
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    }

    if (lastSeen) {
      return {
        text: `Last seen: ${lastSeen}`,
        icon: Clock,
        className: 'bg-gray-100 text-gray-600 border-gray-200',
      };
    }

    return {
      text: 'Unavailable',
      icon: Clock,
      className: 'bg-red-100 text-red-800 border-red-200',
    };
  };

  const { text, icon: Icon, className: statusClassName } = getAvailabilityContent();

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            isAvailable ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
        {showText && (
          <span className={cn(
            'text-xs',
            isAvailable ? 'text-green-700' : 'text-gray-500'
          )}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center border font-medium',
        sizeClasses[size],
        statusClassName,
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], showText && 'mr-1.5')} />}
      {showText && text}
    </Badge>
  );
}

// Hook for real-time availability
export function useAvailability(performerId: string) {
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  // This would typically connect to a real-time service like Supabase realtime
  React.useEffect(() => {
    // Mock implementation - replace with actual real-time subscription
    const checkAvailability = async () => {
      try {
        const response = await fetch(`/api/performers/${performerId}/availability`);
        if (response.ok) {
          const data = await response.json();
          setIsAvailable(data.is_available);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    checkAvailability();

    // Set up polling for updates (replace with WebSocket in production)
    const interval = setInterval(checkAvailability, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [performerId]);

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`/api/performers/${performerId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: !isAvailable,
        }),
      });

      if (response.ok) {
        setIsAvailable(!isAvailable);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  return {
    isAvailable,
    lastUpdated,
    toggleAvailability,
  };
}