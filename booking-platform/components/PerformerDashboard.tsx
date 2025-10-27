'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Booking } from '@/types/database';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  User as UserIcon,
  Clock,
  DollarSign,
  Navigation,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PerformerDashboardProps {
  user: User;
}

export default function PerformerDashboard({ user }: PerformerDashboardProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [etaInputs, setEtaInputs] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchBookings();

    // Subscribe to realtime changes
    const supabase = createClient();
    const channel = supabase
      .channel('performer-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `performer_id=eq.${user.id}`,
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
        .eq('performer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setBookings(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter((b) => b.status === 'pending' || b.status === 'payment_verified').length || 0;
      const accepted = data?.filter((b) => b.status === 'accepted' || b.status === 'confirmed').length || 0;
      const completed = data?.filter((b) => b.status === 'completed').length || 0;

      setStats({ total, pending, accepted, completed });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(bookingId: string) {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept booking');
      }

      await fetchBookings();
    } catch (error: any) {
      alert(error.message || 'Failed to accept booking');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(bookingId: string) {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to decline booking');
      }

      await fetchBookings();
    } catch (error: any) {
      alert(error.message || 'Failed to decline booking');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSubmitETA(bookingId: string) {
    const eta = etaInputs[bookingId];
    if (!eta || !eta.trim()) {
      alert('Please enter an ETA');
      return;
    }

    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/eta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eta: eta.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit ETA');
      }

      setEtaInputs({ ...etaInputs, [bookingId]: '' });
      await fetchBookings();
      alert('ETA submitted! Client and admin have been notified.');
    } catch (error: any) {
      alert(error.message || 'Failed to submit ETA');
    } finally {
      setActionLoading(null);
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
      case 'payment_verified':
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
      case 'payment_verified':
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
                <span className="px-2 py-1 bg-magenta-500/20 text-magenta-400 rounded text-xs">
                  PERFORMER
                </span>
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
            Performer Dashboard - <span className="bg-gradient-magenta bg-clip-text text-transparent">{user.full_name}</span>
          </h1>
          <p className="text-gray-400">Manage your bookings and availability</p>
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
              <span className="text-gray-400 text-sm">Accepted</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{stats.accepted}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completed</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{stats.completed}</div>
          </motion.div>
        </div>

        {/* Bookings */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Your Bookings</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-800 border-t-magenta-500 rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
              <p className="text-gray-400">Bookings will appear here when clients book you</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-800 rounded-lg p-6 hover:border-magenta-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(booking.status)}
                      <div>
                        <span className="font-semibold text-lg">Booking #{booking.booking_number}</span>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-magenta-500">
                        ${booking.total_amount}
                      </div>
                      <div className="text-xs text-gray-500">AUD</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Event Details</div>
                      <div><strong>Type:</strong> {booking.event_type}</div>
                      <div><strong>Name:</strong> {booking.event_name}</div>
                      <div><strong>Duration:</strong> {booking.duration_hours} hours</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Date & Time</div>
                      <div><strong>Date:</strong> {new Date(booking.event_date).toLocaleDateString('en-AU')}</div>
                      <div><strong>Time:</strong> {booking.event_time}</div>
                      <div><strong>Location:</strong> {booking.location}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {booking.status === 'payment_verified' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => handleAccept(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Booking
                      </button>
                      <button
                        onClick={() => handleDecline(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="btn-secondary flex-1 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </button>
                    </div>
                  )}

                  {/* ETA Submission */}
                  {(booking.status === 'accepted' || booking.status === 'confirmed') && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      {booking.performer_eta ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <Navigation className="w-5 h-5" />
                          <span>ETA Sent: {booking.performer_eta}</span>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="e.g., '15 minutes away' or '2:30 PM arrival'"
                            value={etaInputs[booking.id] || ''}
                            onChange={(e) => setEtaInputs({ ...etaInputs, [booking.id]: e.target.value })}
                            className="input-field flex-1"
                          />
                          <button
                            onClick={() => handleSubmitETA(booking.id)}
                            disabled={actionLoading === booking.id}
                            className="btn-primary disabled:opacity-50"
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Send ETA
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
