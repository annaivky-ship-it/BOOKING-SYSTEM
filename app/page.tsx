import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Shield, Zap, Users, MessageCircle, Clock } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-magenta-900/20 via-black to-magenta-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-magenta-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-magenta-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-magenta bg-clip-text text-transparent">
              BookingPro
            </div>
            <div className="flex gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-secondary">
                    Dashboard
                  </Link>
                  <Link href="/performers" className="btn-primary">
                    Browse Performers
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Premium Booking Platform for
              <span className="block bg-gradient-magenta bg-clip-text text-transparent">
                Freelancers & Event Staff
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Secure, real-time bookings with instant WhatsApp notifications.
              Built for the Australian market with PayID integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="btn-primary text-lg px-10 py-4 inline-block"
              >
                Start Booking Now
              </Link>
              <Link
                href="/performers"
                className="btn-secondary text-lg px-10 py-4 inline-block"
              >
                Browse Performers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="relative py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-gray-400 text-lg">
              Production-grade features for seamless bookings
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 group hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-lg bg-gradient-magenta flex items-center justify-center mb-6 group-hover:shadow-magenta-glow transition-shadow">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure & Verified</h3>
              <p className="text-gray-400">
                ID verification, blacklist protection, and AES-256 encrypted data storage
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 group hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-lg bg-gradient-magenta flex items-center justify-center mb-6 group-hover:shadow-magenta-glow transition-shadow">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">WhatsApp Notifications</h3>
              <p className="text-gray-400">
                Instant alerts for bookings, payments, and performer ETA updates
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 group hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-lg bg-gradient-magenta flex items-center justify-center mb-6 group-hover:shadow-magenta-glow transition-shadow">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-time Updates</h3>
              <p className="text-gray-400">
                Live performer availability and instant booking status changes
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-8 group hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-lg bg-gradient-magenta flex items-center justify-center mb-6 group-hover:shadow-magenta-glow transition-shadow">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Easy Scheduling</h3>
              <p className="text-gray-400">
                Smart calendar integration with automatic conflict detection
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card p-8 group hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-lg bg-gradient-magenta flex items-center justify-center mb-6 group-hover:shadow-magenta-glow transition-shadow">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Australian-First</h3>
              <p className="text-gray-400">
                PayID payments, Perth timezone, and local phone number support
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card p-8 group hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-lg bg-gradient-magenta flex items-center justify-center mb-6 group-hover:shadow-magenta-glow transition-shadow">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Performer ETA</h3>
              <p className="text-gray-400">
                Get real-time updates when your performer is on the way
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-magenta-900/20 to-magenta-600/20" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of clients and performers using Australia's most trusted booking platform
          </p>
          <Link href="/signup" className="btn-primary text-lg px-12 py-4 inline-block">
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center text-gray-400">
            <p className="mb-2">© 2025 BookingPro. All rights reserved.</p>
            <p className="text-sm">Built with Next.js, Supabase & Twilio WhatsApp</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
