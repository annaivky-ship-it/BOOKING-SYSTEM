'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock, DollarSign, Heart, Share } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Performer {
  id: string
  stage_name: string
  slug: string
  bio: string
  services: any
  rate_card: any
  is_available: boolean
  hero_image: string
  rating: number
  total_reviews: number
  featured: boolean
  verified: boolean
  profile: {
    display_name: string
    whatsapp: string
    phone: string
    email: string
  }
}

// Memoized performer card component
const PerformerCard = memo(({
  performer,
  isFavorite,
  onToggleFavorite,
  onShare
}: {
  performer: Performer
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onShare: (performer: Performer) => void
}) => (
  <Card key={performer.id} className="card-hover group">
    <div className="relative">
      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg overflow-hidden">
        {performer.hero_image ? (
          <Image
            src={performer.hero_image}
            alt={performer.stage_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">
              {performer.stage_name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {performer.featured && (
          <Badge className="bg-yellow-500 text-yellow-50">Featured</Badge>
        )}
        {performer.verified && (
          <Badge className="bg-blue-500 text-blue-50">Verified</Badge>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="secondary"
          className="p-2"
          onClick={() => onToggleFavorite(performer.id)}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="p-2"
          onClick={() => onShare(performer)}
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </div>

    <CardContent className="p-6">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{performer.stage_name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{performer.rating?.toFixed(1) || 'New'}</span>
              {performer.total_reviews > 0 && (
                <span>({performer.total_reviews} reviews)</span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {performer.bio}
        </p>

        <div className="flex flex-wrap gap-1">
          {Object.keys(performer.services || {}).slice(0, 3).map((service, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {service.replace('_', ' ')}
            </Badge>
          ))}
          {Object.keys(performer.services || {}).length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{Object.keys(performer.services || {}).length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <div className={`w-2 h-2 rounded-full mr-2 ${performer.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{performer.is_available ? 'Available Now' : 'Unavailable'}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>From ${Math.min(...Object.values(performer.rate_card || { default: 100 }))}/hr</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Link href={`/performer/${performer.slug || performer.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
            <Link href={`/book/${performer.id}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
))


interface PerformerGridProps {
  searchQuery?: string
  performanceType?: string
  location?: string
  priceRange?: [number, number]
}

export function PerformerGrid({
  searchQuery,
  performanceType,
  location,
  priceRange
}: PerformerGridProps = {}) {
  const [performers, setPerformers] = useState<Performer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<string>('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const ITEMS_PER_PAGE = 12

  // Memoize search parameters to avoid unnecessary re-renders
  const searchFilters = useMemo(() => ({
    search: searchParams.get('search'),
    type: searchParams.get('type'),
    location: searchParams.get('location'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    available: searchParams.get('available'),
    featured: searchParams.get('featured'),
    verified: searchParams.get('verified')
  }), [searchParams])

  const fetchPerformers = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('performers')
        .select(`
          *,
          profile:profiles!performers_user_id_fkey(
            display_name,
            whatsapp,
            phone,
            email
          )
        `, { count: 'exact' })

      // Apply sorting
      switch (sortBy) {
        case 'featured':
          query = query.order('featured', { ascending: false }).order('rating', { ascending: false })
          break
        case 'rating':
          query = query.order('rating', { ascending: false }).order('total_reviews', { ascending: false })
          break
        case 'price-low':
          query = query.order('rate_card', { ascending: true })
          break
        case 'price-high':
          query = query.order('rate_card', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        default:
          query = query.order('featured', { ascending: false }).order('rating', { ascending: false })
      }

      // Apply filters using memoized values
      if (searchFilters.search) {
        query = query.or(`stage_name.ilike.%${searchFilters.search}%,bio.ilike.%${searchFilters.search}%`)
      }

      if (searchFilters.type) {
        query = query.contains('services', { [searchFilters.type]: true })
      }

      if (searchFilters.available === 'true') {
        query = query.eq('is_available', true)
      }

      if (searchFilters.featured === 'true') {
        query = query.eq('featured', true)
      }

      if (searchFilters.verified === 'true') {
        query = query.eq('verified', true)
      }

      // Add pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase error:', error)

        // Provide more specific error messages
        if (error.code === 'PGRST116') {
          throw new Error('No performers found in database. Please check if data has been seeded.')
        } else if (error.code === 'PGRST301') {
          throw new Error('Database configuration error. Please check if RLS policies are correctly set.')
        } else if (error.message.includes('JWT')) {
          throw new Error('Authentication error. Please check your Supabase configuration.')
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.')
        } else {
          throw new Error(`Database error: ${error.message}`)
        }
      }

      const newPerformers = data || []

      if (reset || currentPage === 1) {
        setPerformers(newPerformers)
      } else {
        setPerformers(prev => [...prev, ...newPerformers])
      }

      setTotalCount(count || 0)
      setHasMore((count || 0) > currentPage * ITEMS_PER_PAGE)
    } catch (err: any) {
      console.error('Error fetching performers:', err)
      setError(err.message || 'Failed to load performers. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [supabase, sortBy, searchFilters, currentPage])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    setPerformers([]) // Clear existing performers
    fetchPerformers(true)
  }, [searchFilters, sortBy, fetchPerformers])

  useEffect(() => {
    if (currentPage > 1) {
      fetchPerformers(false)
    }
  }, [currentPage, fetchPerformers])

  const toggleFavorite = (performerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(performerId)) {
        newFavorites.delete(performerId)
      } else {
        newFavorites.add(performerId)
      }
      return newFavorites
    })
  }

  const sharePerformer = async (performer: Performer) => {
    if (navigator.share) {
      await navigator.share({
        title: performer.stage_name,
        text: performer.bio,
        url: `${window.location.origin}/performers/${performer.id}`
      })
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/performers/${performer.id}`)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Performers</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button
              onClick={() => fetchPerformers()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Try Again
            </Button>
            <p className="text-sm text-gray-500">
              If the problem persists, please check your internet connection or contact support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!loading && performers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No performers found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any performers matching your criteria. Try adjusting your filters or search terms.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => router.push('/performers')}
              variant="outline"
              className="mr-2"
            >
              Clear All Filters
            </Button>
            <Button
              onClick={() => fetchPerformers()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Refresh
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            New to the platform? <Link href="/vetting/apply" className="text-orange-600 hover:text-orange-700">Apply to become a performer</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {performers.length} performer{performers.length !== 1 ? 's' : ''} found
        </p>
        <select
          className="border rounded-md px-3 py-2 bg-white text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Featured First</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {performers.map((performer) => (
          <PerformerCard
            key={performer.id}
            performer={performer}
            isFavorite={favorites.has(performer.id)}
            onToggleFavorite={toggleFavorite}
            onShare={sharePerformer}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && performers.length > 0 && (
        <div className="text-center pt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? 'Loading...' : `Load More Performers (${totalCount - performers.length} remaining)`}
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {performers.length > 0 && (
        <div className="text-center pt-4 text-sm text-muted-foreground">
          Showing {performers.length} of {totalCount} performer{totalCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}