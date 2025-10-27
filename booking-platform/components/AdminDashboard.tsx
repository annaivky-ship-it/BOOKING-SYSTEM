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
  Shield,
  Users,
  DollarSign,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminDashboardProps {
  user: User;
}

interface VettingApplication {
  id: string;
  client_id: string;
  status: string;
  created_at: string;
}

interface BlacklistEntry {
  id: string;
  phone: string;
  email: string | null;
  reason: string;
  created_at: string;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vettingApps, setVettingApps] = useState<VettingApplication[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'vetting' | 'blacklist'>('bookings');
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    pendingVetting: 0,
    blacklistCount: 0,
  });

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const supabase = createClient();
    const bookingsChannel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchData()
      )
      .subscribe();

    const vettingChannel = supabase
      .channel('admin-vetting')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vetting_applications' },
        () => fetchData()
      )
      .subscribe();

    const blacklistChannel = supabase
      .channel('admin-blacklist')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blacklist' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      bookingsChannel.unsubscribe();
      vettingChannel.unsubscribe();
      blacklistChannel.unsubscribe();
    };
  }, []);

  async function fetchData() {
    try {
      const supabase = createClient();

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch vetting applications
      const { data: vettingData } = await supabase
        .from('vetting_applications')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch blacklist
      const { data: blacklistData } = await supabase
        .from('blacklist')
        .select('*')
        .order('created_at', { ascending: false });

      setBookings(bookingsData || []);
      setVettingApps(vettingData || []);
      setBlacklist(blacklistData || []);

      // Calculate stats
      const totalBookings = bookingsData?.length || 0;
      const pendingBookings = bookingsData?.filter(
        (b) => b.status === 'pending' || b.status === 'payment_pending'
      ).length || 0;
      const pendingVetting = vettingData?.filter((v) => v.status === 'pending').length || 0;
      const blacklistCount = blacklistData?.length || 0;

      setStats({ totalBookings, pendingBookings, pendingVetting, blacklistCount });
    } catch (error) {
      console.error('Error fetching data:', error);
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
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
      case 'cancelled':
      case 'rejected':
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
      case 'approved':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'completed':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'declined':
      case 'cancelled':
      case 'rejected':
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
                <Shield className="w-4 h-4" />
                <span>{user.full_name}</span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                  ADMIN
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
            Admin Dashboard - <span className="bg-gradient-magenta bg-clip-text text-transparent">{user.full_name}</span>
          </h1>
          <p className="text-gray-400">Full platform management and oversight</p>
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
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending Bookings</span>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold">{stats.pendingBookings}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending Vetting</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{stats.pendingVetting}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Blacklisted</span>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold">{stats.blacklistCount}</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'border-b-2 border-magenta-500 text-magenta-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            All Bookings
          </button>
          <button
            onClick={() => setActiveTab('vetting')}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === 'vetting'
                ? 'border-b-2 border-magenta-500 text-magenta-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Vetting
            {stats.pendingVetting > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.pendingVetting}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'blacklist'
                ? 'border-b-2 border-magenta-500 text-magenta-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 inline mr-2" />
            Blacklist
          </button>
        </div>

        {/* Tab Content */}
        <div className="card p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-800 border-t-magenta-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">All Bookings</h2>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
                      <p className="text-gray-400">Bookings will appear here</p>
                    </div>
                  ) : (
                    bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border border-gray-800 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(booking.status)}
                              <span className="font-semibold">#{booking.booking_number}</span>
                              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              <div><strong>Event:</strong> {booking.event_name}</div>
                              <div><strong>Date:</strong> {new Date(booking.event_date).toLocaleDateString('en-AU')} at {booking.event_time}</div>
                              {booking.performer_eta && (
                                <div className="text-green-400"><strong>ETA:</strong> {booking.performer_eta}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-magenta-500">${booking.total_amount}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Vetting Tab */}
              {activeTab === 'vetting' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">ID Vetting Applications</h2>
                  {vettingApps.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No Applications</h3>
                      <p className="text-gray-400">Vetting applications will appear here</p>
                    </div>
                  ) : (
                    vettingApps.map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border border-gray-800 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <div className="font-semibold">Application #{app.id.slice(0, 8)}</div>
                              <div className="text-sm text-gray-400">
                                Submitted {new Date(app.created_at).toLocaleDateString('en-AU')}
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Blacklist Tab */}
              {activeTab === 'blacklist' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Blacklisted Contacts</h2>
                  {blacklist.length === 0 ? (
                    <div className="text-center py-12">
                      <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No Blacklist Entries</h3>
                      <p className="text-gray-400">Blacklisted contacts will appear here</p>
                    </div>
                  ) : (
                    blacklist.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border border-red-500/30 bg-red-500/5 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                          <div>
                            <div className="font-semibold">{entry.phone}</div>
                            {entry.email && (
                              <div className="text-sm text-gray-400">{entry.email}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          <strong>Reason:</strong> {entry.reason}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Added {new Date(entry.created_at).toLocaleDateString('en-AU')}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
