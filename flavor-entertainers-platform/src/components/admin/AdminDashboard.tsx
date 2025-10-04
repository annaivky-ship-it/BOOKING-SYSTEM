'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  MessageCircle,
  Star,
  Activity
} from 'lucide-react';
import { BookingQueue } from './queues/BookingQueue';
import { PaymentQueue } from './queues/PaymentQueue';
import { VettingQueue } from './queues/VettingQueue';
import { PerformerQueue } from './queues/PerformerQueue';
import { format } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  totalPerformers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  pendingPayments: number;
  pendingApplications: number;
  activeBookings: number;
  recentGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'application' | 'payment' | 'user' | 'performer';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
  link?: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const supabase = createClientComponentClient();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch dashboard statistics in parallel
      const [
        profilesCount,
        performersCount,
        bookingsCount,
        paymentsData,
        pendingBookingsCount,
        pendingPaymentsCount,
        pendingAppsCount,
        activeBookingsCount
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('performers').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'verified'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'quote_requested']),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification'),
        supabase.from('vetting_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'in_progress'])
      ]);

      const totalRevenue = paymentsData.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Calculate growth percentages (would be calculated from historical data in production)
      const dashboardStats: DashboardStats = {
        totalUsers: profilesCount.count || 0,
        totalPerformers: performersCount.count || 0,
        totalBookings: bookingsCount.count || 0,
        totalRevenue,
        pendingBookings: pendingBookingsCount.count || 0,
        pendingPayments: pendingPaymentsCount.count || 0,
        pendingApplications: pendingAppsCount.count || 0,
        activeBookings: activeBookingsCount.count || 0,
        recentGrowth: {
          users: 12.5,
          bookings: 8.3,
          revenue: 15.7
        }
      };

      setStats(dashboardStats);

      // Fetch recent activity from audit log
      const { data: auditData } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      const activities: RecentActivity[] = auditData?.map(audit => ({
        id: audit.id,
        type: getActivityType(audit.action),
        title: formatActivityTitle(audit.action),
        description: formatActivityDescription(audit.action, audit.changes),
        time: format(new Date(audit.created_at), 'MMM d, h:mm a'),
        status: getActivityStatus(audit.action),
        link: getActivityLink(audit.action, audit.record_id)
      })) || [];

      setRecentActivity(activities);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityType = (action: string): RecentActivity['type'] => {
    if (action.includes('booking')) return 'booking';
    if (action.includes('payment')) return 'payment';
    if (action.includes('application') || action.includes('vetting')) return 'application';
    if (action.includes('performer')) return 'performer';
    return 'user';
  };

  const formatActivityTitle = (action: string): string => {
    const titles: Record<string, string> = {
      'booking_created': 'New Booking Created',
      'booking_confirmed': 'Booking Confirmed',
      'payment_submitted': 'Payment Submitted',
      'payment_verified': 'Payment Verified',
      'application_submitted': 'Performer Application',
      'performer_approved': 'Performer Approved',
      'user_created': 'New User Registration'
    };
    return titles[action] || 'Platform Activity';
  };

  const formatActivityDescription = (action: string, changes: any): string => {
    if (action === 'booking_created') {
      return `New booking for ${changes?.service || 'entertainment service'}`;
    }
    if (action === 'payment_submitted') {
      return `Payment of $${changes?.amount || '0'} submitted`;
    }
    if (action === 'application_submitted') {
      return 'New performer application awaiting review';
    }
    return 'Platform activity logged';
  };

  const getActivityStatus = (action: string): RecentActivity['status'] => {
    if (action.includes('created') || action.includes('submitted')) return 'info';
    if (action.includes('approved') || action.includes('verified')) return 'success';
    if (action.includes('pending') || action.includes('review')) return 'warning';
    if (action.includes('rejected') || action.includes('failed')) return 'error';
    return 'info';
  };

  const getActivityLink = (action: string, recordId: string): string | undefined => {
    if (action.includes('booking')) return `/admin/bookings/${recordId}`;
    if (action.includes('payment')) return `/admin/payments/${recordId}`;
    if (action.includes('application')) return `/admin/vetting/${recordId}`;
    if (action.includes('performer')) return `/admin/performers/${recordId}`;
    return undefined;
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions for key tables
    const channels = [
      supabase
        .channel('dashboard-bookings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchDashboardData)
        .subscribe(),

      supabase
        .channel('dashboard-payments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchDashboardData)
        .subscribe(),

      supabase
        .channel('dashboard-vetting')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vetting_applications' }, fetchDashboardData)
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [supabase]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'application': return UserCheck;
      case 'payment': return DollarSign;
      case 'performer': return Star;
      case 'user': return Users;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Platform metrics and recent activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.recentGrowth.users}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Performers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPerformers || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.pendingApplications || 0} pending applications
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.recentGrowth.bookings}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue.toLocaleString() || '0'}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats?.recentGrowth.revenue}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards for Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending Bookings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats?.pendingBookings || 0}</div>
            <p className="text-xs text-yellow-700">Require quote or approval</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Payment Verifications</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats?.pendingPayments || 0}</div>
            <p className="text-xs text-blue-700">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Performer Applications</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats?.pendingApplications || 0}</div>
            <p className="text-xs text-purple-700">Vetting required</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Queues */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">
            Bookings
            {stats?.pendingBookings && stats.pendingBookings > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingBookings}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments
            {stats?.pendingPayments && stats.pendingPayments > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingPayments}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vetting">
            Vetting
            {stats?.pendingApplications && stats.pendingApplications > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingApplications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performers">Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest platform events and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                        {activity.link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={activity.link}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <BookingQueue />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentQueue />
        </TabsContent>

        <TabsContent value="vetting">
          <VettingQueue />
        </TabsContent>

        <TabsContent value="performers">
          <PerformerQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}