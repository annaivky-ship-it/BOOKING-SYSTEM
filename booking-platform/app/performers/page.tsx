import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PerformerGrid from '@/components/PerformerGrid';

export default function PerformersPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
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

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-magenta-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Available <span className="bg-gradient-magenta bg-clip-text text-transparent">Performers</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find and book top-rated freelancers and event staff in Australia
          </p>
        </div>
      </section>

      {/* Performers Grid */}
      <section className="container mx-auto px-6 pb-20">
        <PerformerGrid />
      </section>
    </div>
  );
}
