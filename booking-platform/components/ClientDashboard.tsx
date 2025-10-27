'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Booking } from '@/types/database';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClientDashboardProps {
  user: User;
}

export default function ClientDashboard({ user }: ClientDashboardProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchBookings();

    // Subscribe to realtime changes
    const supabase = createClient();
    const channel = supabase
      .channel('client-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `client_id=eq.${user.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user.id]);

  async function fetchBookings() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setBookings(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter((b) => b.status === 'pending' || b.status === 'payment_pending').length || 0;
      const confirmed = data?.filter((b) => b.status === 'confirmed' || b.status === 'accepted').length || 0;
      const completed = data?.filter((b) => b.status === 'completed').length || 0;

      setStats({ total, pending, confirmed, completed });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'confirmed':
      case 'accepted':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'payment_pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'completed':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'declined':
      case 'cancelled':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'pending':
      case 'payment_pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-gradient-magenta bg-clip-text text-transparent">
              BookingPro
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <UserIcon className="w-4 h-4" />
                <span>{user.full_name}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-magenta bg-clip-text text-transparent">{user.full_name}</span>
          </h1>
          <p className="text-gray-400">Manage your bookings and find performers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Bookings</span>
              <Calendar className="w-5 h-5 text-magenta-500" />
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending</span>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Confirmed</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{stats.confirmed}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completed</span>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{stats.completed}</div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/performers" className="btn-primary p-6 text-center">
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="text-lg font-semibold">Create New Booking</span>
          </Link>
          <Link href="/performers" className="btn-secondary p-6 text-center">
            <UserIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-lg font-semibold">Browse Performers</span>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Bookings</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-800 border-t-magenta-500 rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
              <p className="text-gray-400 mb-6">Start by browsing available performers</p>
              <Link href="/performers" className="btn-primary">
                Browse Performers
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-800 rounded-lg p-4 hover:border-magenta-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(booking.status)}
                        <span className="font-semibold">Booking #{booking.booking_number}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>
                          <strong>Event:</strong> {booking.event_type} - {booking.event_name}
                        </div>
                        <div>
                          <strong>Date:</strong> {new Date(booking.event_date).toLocaleDateString('en-AU')} at {booking.event_time}
                        </div>
                        <div>
                          <strong>Duration:</strong> {booking.duration_hours} hours
                        </div>
                        {booking.performer_eta && (
                          <div className="text-green-400">
                            <strong>Performer ETA:</strong> {booking.performer_eta}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-magenta-500">
                        ${booking.total_amount}
                      </div>
                      <div className="text-xs text-gray-500">AUD</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
