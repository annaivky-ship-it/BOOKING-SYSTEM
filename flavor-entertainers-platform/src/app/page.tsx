import { Button } from '@/components/ui/button'
import { ArrowRight, Star } from 'lucide-react'
import { LivePerformersGrid } from '@/components/performers/live-performers-grid'
import { AgeGateModal } from '@/components/compliance/AgeGateModal'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <AgeGateModal />

      {/* Simplified Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 orange-glow">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Australia's Premier Entertainment Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Book <span className="text-shimmer">Professional</span>
              <br />
              Entertainers
            </h1>

            <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
              Connect with vetted performers for your next event.
              Simple booking, instant confirmation.
            </p>

            <Button size="lg" className="text-lg px-8 py-4 btn-premium orange-glow mb-16" asChild>
              <Link href="/performers">
                Browse Performers
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Performers Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Available Now
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Professional entertainers ready to make your event unforgettable
            </p>
          </div>

          <LivePerformersGrid />

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-orange-500/20 hover:bg-orange-500/5" asChild>
              <Link href="/performers">
                View All Performers
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Simple Trust Indicators */}
      <section className="py-16 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">500+</div>
              <div className="text-zinc-400">Verified Performers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">10k+</div>
              <div className="text-zinc-400">Successful Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">4.9★</div>
              <div className="text-zinc-400">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}