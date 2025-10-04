'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Users,
  UserCheck,
  Shield,
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  Home,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
    description: 'Manage all bookings',
    badge: 'pending'
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
    description: 'Payment verification',
    badge: 'verification'
  },
  {
    title: 'Performers',
    href: '/admin/performers',
    icon: UserCheck,
    description: 'Performer management'
  },
  {
    title: 'Vetting',
    href: '/admin/vetting',
    icon: Shield,
    description: 'Application reviews',
    badge: 'review'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: FileText,
    description: 'Reports and insights'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<number>(0);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
    fetchPendingCounts();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
        return;
      }

      setUser({ ...session.user, profile });
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth/login?redirect=/admin');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingCounts = async () => {
    try {
      const [bookings, payments, vetting] = await Promise.all([
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'quote_requested']),
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending_verification'),
        supabase
          .from('vetting_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
      ]);

      setPendingCounts({
        pending: bookings.count || 0,
        verification: payments.count || 0,
        review: vetting.count || 0
      });

      const totalNotifications = (bookings.count || 0) + (payments.count || 0) + (vetting.count || 0);
      setNotifications(totalNotifications);
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const getBadgeCount = (badge: string) => {
    return pendingCounts[badge] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center px-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && getBadgeCount(item.badge) > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {getBadgeCount(item.badge)}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2 font-semibold">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FE</span>
              </div>
              <span className="hidden sm:inline">Admin Dashboard</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1 ml-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Public Site
              </Button>
            </Link>
          </nav>

          <div className="ml-auto flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium">{user?.profile?.display_name || user?.email}</div>
                <div className="text-xs text-muted-foreground">Administrator</div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-white h-[calc(100vh-4rem)]">
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && getBadgeCount(item.badge) > 0 && (
                    <Badge variant="destructive">
                      {getBadgeCount(item.badge)}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h4>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/admin/vetting">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review Applications
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/admin/payments">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Payments
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}