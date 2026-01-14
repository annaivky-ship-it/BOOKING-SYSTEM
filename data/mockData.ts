
import type { Performer, Booking, DoNotServeEntry, Service, Communication } from '../types';

export const WA_REGIONS = [
  'Perth CBD & Inner',
  'North Metro (Joondalup)',
  'South Metro (Freo/Rocko)',
  'East Metro (Swan Valley)',
  'Mandurah & Peel',
  'South West (Busselton/Marg River)',
  'North West / Pilbara'
];

export const allServices: Service[] = [
    // Waitressing
    { id: 'waitress-lingerie', category: 'Waitressing', name: 'Lingerie Waitress', description: 'Classy and flirty. Serving drinks in premium lingerie sets.', rate: 110, rate_type: 'per_hour', min_duration_hours: 1, booking_notes: 'Perfect for private catch-ups' },
    { id: 'waitress-topless', category: 'Waitressing', name: 'Topless Waitress', description: 'Fun, cheeky service for any party vibe.', rate: 160, rate_type: 'per_hour', min_duration_hours: 1, booking_notes: 'Private events only' },
    { id: 'waitress-nude', category: 'Waitressing', name: 'Nude Waitress', description: 'Bold and beautiful. Full nude service for the ultimate party.', rate: 260, rate_type: 'per_hour', min_duration_hours: 1, booking_notes: 'Full disclosure required' },
    // Strip Shows
    { id: 'show-hot-cream', category: 'Strip Show', name: 'Hot Cream Show', description: 'A cheeky strip ending with some whipped cream fun.', rate: 380, rate_type: 'flat', duration_minutes: 10, booking_notes: 'Messy but memorable' },
    { id: 'show-pearl', category: 'Strip Show', name: 'Pearl Show', description: 'G-string strip with a classic finish.', rate: 500, rate_type: 'flat', duration_minutes: 15, booking_notes: 'Classic solo vibes' },
    { id: 'show-toy', category: 'Strip Show', name: 'Toy Show', description: 'Full nude performance with high-end toy play.', rate: 550, rate_type: 'flat', duration_minutes: 15, booking_notes: 'Explicit performance' },
    { id: 'show-pearls-vibe-cream', category: 'Strip Show', name: 'Pearls, Vibe + Cream', description: 'The triple threat: cream, pearls, and toys.', rate: 650, rate_type: 'flat', duration_minutes: 20, booking_notes: 'Our most popular show' },
    { id: 'show-works-fruit', category: 'Strip Show', name: 'Works + Fruit', description: 'A fresh twist on the deluxe show using fruit play.', rate: 650, rate_type: 'flat', duration_minutes: 20, booking_notes: 'Sweet and spicy' },
    { id: 'show-deluxe-works', category: 'Strip Show', name: 'Deluxe Works Show', description: 'The full wet show experience.', rate: 700, rate_type: 'flat', duration_minutes: 20, booking_notes: 'Waterproof area recommended' },
    { id: 'show-fisting-squirting', category: 'Strip Show', name: 'Fisting Squirting', description: 'Explicit adult show for a more adventurous crowd.', rate: 750, rate_type: 'flat', duration_minutes: 20, booking_notes: 'Strictly 18+' },
    { id: 'show-works-greek', category: 'Strip Show', name: 'Works + Greek Show', description: 'Deluxe show with added back-door toy play.', rate: 850, rate_type: 'flat', duration_minutes: 20, booking_notes: 'Premium adult content' },
    { id: 'show-absolute-works', category: 'Strip Show', name: 'The Absolute Works', description: 'Everything on the menu. The ultimate performance.', rate: 1000, rate_type: 'flat', duration_minutes: 25, booking_notes: 'The big one' },
    // Promotional & Hosting Services
    { id: 'misc-promo-model', category: 'Promotional & Hosting', name: 'Promo Model', description: 'Engaging, professional models to rep your brand.', rate: 100, rate_type: 'per_hour', min_duration_hours: 2 },
    { id: 'misc-atmospheric', category: 'Promotional & Hosting', name: 'Event Hosting', description: 'Classy hosts to welcome guests and set the mood.', rate: 90, rate_type: 'per_hour', min_duration_hours: 2 },
    { id: 'misc-games-host', category: 'Promotional & Hosting', name: 'Game Hosting', description: 'Keeping the party alive with fun games and interaction.', rate: 120, rate_type: 'per_hour', min_duration_hours: 1 },
];

export const mockPerformers: Performer[] = [
  {
    id: 5,
    name: 'April Flavor',
    tagline: 'Sweet, sassy, and always ready to party.',
    photo_url: 'https://i.imgur.com/fJHc978.jpeg',
    gallery_urls: [
        'https://images.pexels.com/photos/1755385/pexels-photo-1755385.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1755390/pexels-photo-1755390.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    bio: 'April is pure energy. With a background in dance and modeling, she knows exactly how to work a room. Whether it is a high-stakes corporate gig or a wild house party, she brings the vibes and keeps them high all night long.',
    service_ids: ['waitress-topless', 'show-hot-cream', 'show-pearl', 'show-deluxe-works', 'misc-promo-model'],
    service_areas: ['Perth CBD & Inner', 'North Metro (Joondalup)', 'South Metro (Freo/Rocko)', 'East Metro (Swan Valley)'],
    status: 'available',
    created_at: new Date().toISOString(),
    phone: '+61400000005',
    featured: true,
    rating: 5
  },
  {
    id: 6,
    name: 'Anna Ivky',
    tagline: 'High-end sophistication with a cheeky side.',
    photo_url: 'https://i.imgur.com/ece0iUZ.jpeg',
    gallery_urls: [
        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    bio: 'Anna is all about the finer things. Shes refined, professional, and perfect for exclusive events where discretion is key. Shes a regular at Perths VIP parties and knows how to make every guest feel like a rockstar.',
    service_ids: ['waitress-lingerie', 'show-toy', 'show-works-greek', 'show-absolute-works'],
    service_areas: ['Perth CBD & Inner', 'South Metro (Freo/Rocko)', 'Mandurah & Peel'],
    status: 'available',
    created_at: new Date().toISOString(),
    phone: '+61400000006',
    featured: true,
    rating: 5
  },
  {
    id: 1,
    name: 'Scarlett',
    tagline: 'Guaranteed to be the life of your party.',
    photo_url: 'https://images.pexels.com/photos/1485031/pexels-photo-1485031.jpeg?auto=compress&cs=tinysrgb&w=800',
    gallery_urls: [],
    bio: 'Scarlett is a total pro. Shes been a favorite in the Perth scene for years because she knows exactly how to read the room. Shes vibrant, chatty, and always ready to make your night one to remember.',
    service_ids: ['waitress-topless', 'waitress-nude', 'show-hot-cream', 'misc-atmospheric'],
    service_areas: ['Perth CBD & Inner', 'North Metro (Joondalup)', 'East Metro (Swan Valley)'],
    status: 'available',
    created_at: new Date().toISOString(),
    phone: '+61400000001',
    featured: true,
    rating: 4.9
  }
];

export const mockBookings: Booking[] = [
    {
        id: 'bfa3e8a7-58d6-44b1-8798-294956e105b6',
        performer_id: 1,
        client_name: 'John Smith',
        client_email: 'john.smith@example.com',
        client_phone: '0412345678',
        event_date: '2024-08-15',
        event_time: '19:00',
        event_address: '123 Fun Street, Perth WA',
        event_type: 'Bucks Night',
        status: 'confirmed',
        id_document_path: null,
        // Fixed: added missing confirmation_document_path property
        confirmation_document_path: null,
        deposit_receipt_path: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration_hours: 4,
        number_of_guests: 50,
        services_requested: ['waitress-topless'],
        verified_by_admin_name: 'Admin Demo',
        verified_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        client_message: 'Keep the energy high for the boys!',
        performer: { id: 1, name: 'Scarlett', phone: '+61400000001' },
        performer_eta_minutes: 25,
    }
];

export const mockDoNotServeList: DoNotServeEntry[] = [
    {
        id: 'dns-1',
        client_name: 'Problem Alex',
        client_email: 'alex.blocked@example.com',
        client_phone: '0400111222',
        reason: 'Rude to talent and refused to follow simple house rules.',
        status: 'approved',
        submitted_by_performer_id: 1,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        performer: { name: 'Scarlett' }
    }
];

export const mockCommunications: Communication[] = [
    {
        id: 'comm-1',
        sender: 'System',
        recipient: 'admin',
        message: 'Booking for John Smith is locked in.',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        booking_id: 'bfa3e8a7-58d6-44b1-8798-294956e105b6'
    }
];
