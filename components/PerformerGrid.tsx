'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PerformerGrid() {
  const [performers, setPerformers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available'>('all');

  useEffect(() => {
    fetchPerformers();

    // Subscribe to realtime changes
    const supabase = createClient();
    const channel = supabase
      .channel('performers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: 'role=eq.performer',
        },
        () => {
          fetchPerformers();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [filter]);

  async function fetchPerformers() {
    try {
      const supabase = createClient();
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'performer')
        .eq('is_active', true)
        .order('full_name');

      if (filter === 'available') {
        query = query.eq('is_available', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPerformers(data || []);
    } catch (error) {
      console.error('Error fetching performers:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-800 border-t-magenta-500 rounded-full animate-spin" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-magenta-400 rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {filter === 'all' ? 'All Performers' : 'Available Now'}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-magenta text-white shadow-magenta-glow'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'available'
                ? 'bg-gradient-magenta text-white shadow-magenta-glow'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Available Now
          </button>
        </div>
      </div>

      {/* Empty State */}
      {performers.length === 0 ? (
        <div className="text-center py-20 card p-12">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No Performers Found</h3>
          <p className="text-gray-400 mb-6">
            {filter === 'available'
              ? 'No performers are currently available. Try viewing all performers.'
              : 'No performers have joined yet. Check back soon!'}
          </p>
          {filter === 'available' && (
            <button onClick={() => setFilter('all')} className="btn-primary">
              View All Performers
            </button>
          )}
        </div>
      ) : (
        /* Performers Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performers.map((performer, index) => (
            <motion.div
              key={performer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div className="card group overflow-hidden h-full">
                {/* Performer Image/Avatar */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-magenta-900/30 to-magenta-600/30">
                  {performer.avatar_url ? (
                    <img
                      src={performer.avatar_url}
                      alt={performer.full_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-8xl font-bold text-magenta-500/50">
                        {performer.full_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Availability Badge */}
                  {performer.is_available && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-sm font-semibold">Available</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Performer Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-magenta-500 transition-colors">
                    {performer.full_name}
                  </h3>

                  <div className="space-y-2 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Perth, WA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>4.9 (127 reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Responds within 1 hour</span>
                    </div>
                  </div>

                  <Link href={`/performers/${performer.id}/book`} className="btn-primary w-full block text-center">
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
