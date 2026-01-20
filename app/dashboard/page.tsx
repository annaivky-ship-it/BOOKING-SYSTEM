import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientDashboard from '@/components/ClientDashboard';
import PerformerDashboard from '@/components/PerformerDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Render dashboard based on role
  return (
    <div className="min-h-screen bg-black text-white">
      {profile.role === 'admin' && <AdminDashboard user={profile} />}
      {profile.role === 'performer' && <PerformerDashboard user={profile} />}
      {profile.role === 'client' && <ClientDashboard user={profile} />}
    </div>
  );
}
