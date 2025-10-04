import { LivePerformersGrid } from '@/components/performers/live-performers-grid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

export default function PerformersPage() {
  return (
    <div className="min-h-screen dark-radial-bg py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect <span className="text-shimmer">Performer</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Browse professional entertainers available for your next event
          </p>
        </div>

        {/* Simple Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <Input
                  placeholder="Search by name or type..."
                  className="pl-10"
                />
              </div>
            </div>

            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="dance">Dance</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="dj">DJ</SelectItem>
                <SelectItem value="magic">Magic</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="sydney">Sydney</SelectItem>
                <SelectItem value="melbourne">Melbourne</SelectItem>
                <SelectItem value="brisbane">Brisbane</SelectItem>
                <SelectItem value="perth">Perth</SelectItem>
                <SelectItem value="adelaide">Adelaide</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Available Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-zinc-400">
              Showing 4 available performers
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <LivePerformersGrid />
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="border-orange-500/20 hover:bg-orange-500/5">
            Load More Performers
          </Button>
        </div>
      </div>
    </div>
  )
}