'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AvailabilityDashboard } from '@/components/availability/availability-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  Bell,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PerformerData {
  id: string;
  user_id: string;
  stage_name: string;
  availability_status: 'available' | 'busy' | 'unavailable';
  verification_status: 'pending' | 'verified' | 'rejected';
}

export default function AvailabilityPage() {
  const [performer, setPerformer] = useState<PerformerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadPerformerData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast.error('Please log in to access your availability dashboard');
          return;
        }

        const { data: performerData, error } = await supabase
          .from('performers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading performer data:', error);
          toast.error('Failed to load performer data');
          return;
        }

        setPerformer(performerData);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Error:', error);
        setConnectionStatus('disconnected');
        toast.error('Failed to connect to availability system');
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformerData();

    // Simulate real-time connection monitoring
    const connectionInterval = setInterval(() => {
      // In a real app, this would check actual connection status
      if (Math.random() > 0.95) {
        setConnectionStatus(prev => prev === 'connected' ? 'connecting' : 'connected');
        setTimeout(() => setConnectionStatus('connected'), 2000);
      }
    }, 10000);

    return () => clearInterval(connectionInterval);
  }, [supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your availability dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!performer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load performer data. Please refresh the page or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Activity className="w-8 h-8 text-primary" />
            <span>Real-Time Availability</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your availability and connect with clients instantly
          </p>
        </div>

        {/* Status Cards */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                connectionStatus === 'connected' && "bg-green-500 animate-pulse",
                connectionStatus === 'connecting' && "bg-yellow-500 animate-bounce",
                connectionStatus === 'disconnected' && "bg-red-500"
              )}></div>
              <span className={cn("text-sm font-medium", getConnectionStatusColor(connectionStatus))}>
                {connectionStatus === 'connected' && 'Live Updates Active'}
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'disconnected' && 'Connection Lost'}
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getStatusColor(performer.availability_status)}>
                {performer.availability_status.charAt(0).toUpperCase() + performer.availability_status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">Current Status</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Verification Alert */}
      {performer.verification_status !== 'verified' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your account is pending verification. Some features may be limited until verification is complete.
            <Button variant="link" className="p-0 h-auto ml-2 text-primary">
              Learn more about verification
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Real-Time Features Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Real-time features are now active!</strong> Your availability updates instantly across the platform.
          Clients can see your status changes in real-time and book available slots immediately.
        </AlertDescription>
      </Alert>

      {/* Availability Dashboard */}
      <AvailabilityDashboard performerId={performer.id} />

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>Instant Bookings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              Clients can book your available slots instantly without waiting for confirmation.
              Perfect for last-minute opportunities.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2 text-blue-800">
              <Bell className="w-5 h-5" />
              <span>Smart Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">
              Get notified via SMS, email, and WhatsApp when new bookings come in.
              Customize your notification preferences for different times and priorities.
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2 text-purple-800">
              <TrendingUp className="w-5 h-5" />
              <span>Performance Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">
              Track your response times, booking success rates, and earnings.
              Get insights to optimize your availability and increase bookings.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Getting Started with Real-Time Availability</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Quick Setup Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set your availability status to get bookings</li>
                <li>• Enable auto-accept for trusted time slots</li>
                <li>• Configure notification preferences</li>
                <li>• Keep your calendar updated for best results</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Maximize Your Earnings</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Update your status throughout the day</li>
                <li>• Respond to inquiries within 2 hours</li>
                <li>• Use the mobile app for on-the-go updates</li>
                <li>• Enable location sharing for nearby bookings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}