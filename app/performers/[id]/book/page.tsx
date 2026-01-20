import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ConnectedBookingWizard from '@/components/ConnectedBookingWizard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Performer, Booking } from '@/types';

export default async function BookPerformerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!clientProfile || clientProfile.role !== 'client') {
    redirect('/dashboard');
  }

  // Get performer details
  const { data: performerData } = await supabase
    .from('performers')
    .select('*')
    .eq('id', id)
    .eq('status', 'available') // Only available performers
    .single();

  if (!performerData) {
    redirect('/performers');
  }

  // Map DB performer to Type performer (add missing fields if needed)
  const performer: Performer = {
    ...performerData,
    // Ensure strict typing or fallback
  } as unknown as Performer; // leveraging unknown cast if DB types essentially match logic

  // Get client's previous bookings (for verification logic in BookingProcess)
  const { data: clientBookings } = await supabase
    .from('bookings')
    .select('*, performer:performers(*)') // Fix relation query
    .eq('client_email', clientProfile.email); // Assuming email link

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/performers"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Performers
            </Link>
            <div className="text-xl font-bold bg-gradient-magenta bg-clip-text text-transparent">
              BookingPro
            </div>
            <Link href="/dashboard" className="btn-secondary text-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Wizard */}
      <div className="container mx-auto px-6 py-12">
        <ConnectedBookingWizard
          performers={[performer]}
          client={clientProfile}
          previousBookings={(clientBookings as unknown as Booking[]) || []}
        />
      </div>
    </div>
  );
}
