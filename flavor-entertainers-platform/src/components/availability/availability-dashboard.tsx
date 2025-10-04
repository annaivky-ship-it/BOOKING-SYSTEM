'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailabilityToggle } from './availability-toggle';
import { LiveCalendar } from './live-calendar';
import { StatusUpdates } from './status-updates';
import { AvailabilityNotifications } from './availability-notifications';
import {
  Calendar,
  Clock,
  Bell,
  Settings,
  Activity,
  TrendingUp,
  Users,
  MapPin,
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityStats {
  totalBookings: number;
  upcomingBookings: number;
  availableSlots: number;
  responseRate: number;
  averageResponseTime: string;
  totalEarnings: number;
  weeklyGrowth: number;
}

interface AvailabilityDashboardProps {
  performerId: string;
  className?: string;
}

export function AvailabilityDashboard({
  performerId,
  className
}: AvailabilityDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState<AvailabilityStats>({
    totalBookings: 47,
    upcomingBookings: 8,
    availableSlots: 23,
    responseRate: 95,
    averageResponseTime: '1.2 hours',
    totalEarnings: 12450,
    weeklyGrowth: 18
  });

  const quickActions = [
    {
      icon: CheckCircle,
      label: 'Set Available',
      action: () => console.log('Set available'),
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      icon: AlertCircle,
      label: 'Block Time',
      action: () => console.log('Block time'),
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    {
      icon: Calendar,
      label: 'View Calendar',
      action: () => setActiveTab('calendar'),
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => setActiveTab('notifications'),
      color: 'text-gray-600 bg-gray-50 border-gray-200'
    }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
          {trend && (
            <div className={cn(
              "flex items-center space-x-1 text-sm mt-1",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <TrendingUp className="w-3 h-3" />
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="text-muted-foreground">this week</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Availability Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your availability and stay connected with clients in real-time
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Updates</span>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Zap className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All time"
        />
        <StatCard
          icon={Clock}
          title="Upcoming"
          value={stats.upcomingBookings}
          subtitle="Next 30 days"
        />
        <StatCard
          icon={Activity}
          title="Available Slots"
          value={stats.availableSlots}
          subtitle="This week"
        />
        <StatCard
          icon={TrendingUp}
          title="Response Rate"
          value={`${stats.responseRate}%`}
          trend={{ value: stats.weeklyGrowth, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn("h-auto p-4 flex-col space-y-2", action.color)}
                onClick={action.action}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Updates</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Availability Toggle */}
            <div className="lg:col-span-1">
              <AvailabilityToggle
                performerId={performerId}
                className="h-fit"
              />
            </div>

            {/* Performance Metrics */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Performance Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Response Time</span>
                        <Badge variant="secondary">{stats.averageResponseTime}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Earnings</span>
                        <Badge variant="secondary">${stats.totalEarnings.toLocaleString()}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Weekly Growth</span>
                        <Badge variant="secondary" className="text-green-700">
                          +{stats.weeklyGrowth}%
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Booking Success Rate</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Client Satisfaction</span>
                          <span>4.8/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Profile Completeness</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tips for Improvement */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Tip for Better Performance</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Upload more recent photos to increase your booking rate by up to 30%.
                          Clients love seeing fresh, high-quality images of your performances.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: '2 minutes ago',
                    action: 'New booking request from Sarah Wilson',
                    type: 'booking',
                    status: 'pending'
                  },
                  {
                    time: '15 minutes ago',
                    action: 'Status changed to Available',
                    type: 'status',
                    status: 'completed'
                  },
                  {
                    time: '1 hour ago',
                    action: 'Payment received for Crown Perth performance',
                    type: 'payment',
                    status: 'completed'
                  },
                  {
                    time: '3 hours ago',
                    action: 'Profile viewed by Mike Johnson',
                    type: 'view',
                    status: 'info'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.status === 'pending' && "bg-yellow-500",
                      activity.status === 'completed' && "bg-green-500",
                      activity.status === 'info' && "bg-blue-500"
                    )}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <LiveCalendar
            performerId={performerId}
            showBookingDetails={true}
          />
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <StatusUpdates
            performerId={performerId}
            showNotifications={true}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <AvailabilityNotifications
            performerId={performerId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}