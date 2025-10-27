import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BookingForm from '@/components/BookingForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!clientProfile || clientProfile.role !== 'client') {
    redirect('/dashboard');
  }

  // Get performer details
  const { data: performer } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', 'performer')
    .single();

  if (!performer) {
    redirect('/performers');
  }

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

      {/* Booking Form */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Book <span className="bg-gradient-magenta bg-clip-text text-transparent">{performer.full_name}</span>
            </h1>
            <p className="text-gray-400">Fill in the details to create your booking</p>
          </div>

          <BookingForm performer={performer} client={clientProfile} />
        </div>
      </div>
    </div>
  );
}
