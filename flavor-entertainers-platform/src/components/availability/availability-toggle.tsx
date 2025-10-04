'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AvailabilityStatus {
  id: string;
  performer_id: string;
  status: 'available' | 'busy' | 'unavailable' | 'break';
  location?: string;
  notes?: string;
  auto_accept_bookings: boolean;
  updated_at: string;
  next_available?: string;
}

interface AvailabilityToggleProps {
  performerId: string;
  initialStatus?: AvailabilityStatus;
  onStatusChange?: (status: AvailabilityStatus) => void;
  className?: string;
}

const statusConfig = {
  available: {
    label: 'Available',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: CheckCircle,
    description: 'Ready to accept bookings'
  },
  busy: {
    label: 'Busy',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: Clock,
    description: 'Currently performing or booked'
  },
  unavailable: {
    label: 'Unavailable',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: AlertCircle,
    description: 'Not accepting bookings'
  },
  break: {
    label: 'On Break',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: Clock,
    description: 'Taking a short break'
  }
};

export function AvailabilityToggle({
  performerId,
  initialStatus,
  onStatusChange,
  className
}: AvailabilityToggleProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(
    initialStatus || {
      id: '',
      performer_id: performerId,
      status: 'unavailable',
      auto_accept_bookings: false,
      updated_at: new Date().toISOString()
    }
  );
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Simulate real-time connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    // Simulate periodic sync
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        setLastSync(new Date());
      }
    }, 30000); // Sync every 30 seconds

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(syncInterval);
    };
  }, []);

  const updateStatus = async (newStatus: Partial<AvailabilityStatus>) => {
    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedStatus = {
        ...status,
        ...newStatus,
        updated_at: new Date().toISOString()
      };

      setStatus(updatedStatus);
      setLastSync(new Date());
      onStatusChange?.(updatedStatus);

      toast.success(`Status updated to ${statusConfig[updatedStatus.status].label}`);
    } catch (error) {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleQuickStatus = () => {
    const currentStatus = status.status;
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    updateStatus({ status: newStatus });
  };

  const setSpecificStatus = (newStatus: AvailabilityStatus['status']) => {
    updateStatus({ status: newStatus });
  };

  const toggleAutoAccept = () => {
    updateStatus({ auto_accept_bookings: !status.auto_accept_bookings });
  };

  const currentConfig = statusConfig[status.status];
  const StatusIcon = currentConfig.icon;

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Availability Status</CardTitle>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className={cn(
          "p-4 rounded-lg border-2 transition-all",
          currentConfig.bgColor,
          `border-${currentConfig.color.replace('bg-', '')}`
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn("w-3 h-3 rounded-full", currentConfig.color)}></div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <StatusIcon className={cn("w-4 h-4", currentConfig.textColor)} />
                <span className={cn("font-medium", currentConfig.textColor)}>
                  {currentConfig.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {currentConfig.description}
              </p>
            </div>
            {isUpdating && (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Quick Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Quick Toggle</span>
            <Badge variant="outline" className="text-xs">
              {status.status === 'available' ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
          <Switch
            checked={status.status === 'available'}
            onCheckedChange={toggleQuickStatus}
            disabled={isUpdating || !isOnline}
          />
        </div>

        {/* Status Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Set Status</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(statusConfig).map(([key, config]) => {
              const isActive = status.status === key;
              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSpecificStatus(key as AvailabilityStatus['status'])}
                  disabled={isUpdating || !isOnline}
                  className={cn(
                    "justify-start text-xs",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <config.icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Auto-Accept Bookings */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">Auto-Accept Bookings</span>
              {status.auto_accept_bookings && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically accept bookings when available
            </p>
          </div>
          <Switch
            checked={status.auto_accept_bookings}
            onCheckedChange={toggleAutoAccept}
            disabled={isUpdating || !isOnline || status.status !== 'available'}
          />
        </div>

        {/* Location & Notes */}
        {status.location && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{status.location}</span>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last synced: {lastSync.toLocaleTimeString()}
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              You're offline. Changes will sync when connection is restored.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}