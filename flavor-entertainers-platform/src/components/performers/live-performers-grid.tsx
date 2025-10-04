'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Demo data for when database is not available
const DEMO_PERFORMERS = [
  {
    id: '1',
    stage_name: 'Anna Ivky',
    bio: 'Professional dancer and entertainer with 8+ years experience',
    performance_types: ['Dance', 'Entertainment'],
    location: 'Sydney, NSW',
    rating: 4.9,
    total_reviews: 127,
    base_rate: 250,
    image: '/api/placeholder/300/300',
    availability_status: 'Available Now',
  },
  {
    id: '2',
    stage_name: 'Sophie Grace',
    bio: 'Singer-songwriter specializing in acoustic performances',
    performance_types: ['Music', 'Vocals'],
    location: 'Melbourne, VIC',
    rating: 4.8,
    total_reviews: 89,
    base_rate: 200,
    image: '/api/placeholder/300/300',
    availability_status: 'Available Today',
  },
  {
    id: '3',
    stage_name: 'Max Comedy',
    bio: 'Stand-up comedian bringing laughs to corporate events',
    performance_types: ['Comedy', 'MC'],
    location: 'Brisbane, QLD',
    rating: 4.7,
    total_reviews: 156,
    base_rate: 180,
    image: '/api/placeholder/300/300',
    availability_status: 'Available This Week',
  },
  {
    id: '4',
    stage_name: 'DJ Phoenix',
    bio: 'Professional DJ with premium sound equipment',
    performance_types: ['DJ', 'Music'],
    location: 'Perth, WA',
    rating: 4.9,
    total_reviews: 203,
    base_rate: 300,
    image: '/api/placeholder/300/300',
    availability_status: 'Available Now',
  },
];

function PerformerCard({ performer }: { performer: typeof DEMO_PERFORMERS[0] }) {
  return (
    <Card className="card-premium card-hover group">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={performer.image}
            alt={performer.stage_name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-500/90 text-white">
              <Clock className="w-3 h-3 mr-1" />
              {performer.availability_status}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-white text-xs font-medium">{performer.rating}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-lg text-white mb-2">{performer.stage_name}</h3>
          <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{performer.bio}</p>

          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-zinc-500" />
            <span className="text-zinc-400 text-sm">{performer.location}</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {performer.performance_types.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-400 font-semibold">
                From ${performer.base_rate}
              </div>
              <div className="text-xs text-zinc-500">
                {performer.total_reviews} reviews
              </div>
            </div>

            <Button size="sm" className="btn-premium group-hover:shadow-lg" asChild>
              <Link href={`/book?performer=${performer.id}`}>
                Book Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LivePerformersGrid() {
  const [performers] = useState(DEMO_PERFORMERS);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performers.map((performer) => (
          <PerformerCard key={performer.id} performer={performer} />
        ))}
      </div>
    </div>
  );
}