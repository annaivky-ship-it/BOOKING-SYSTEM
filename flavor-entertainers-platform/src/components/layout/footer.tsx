'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NewsletterSection } from './newsletter-section';
import {
  Star,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Shield,
  Heart,
  Users,
  Calendar,
  Clock,
  ArrowUp
} from 'lucide-react';

const footerSections = {
  services: {
    title: 'Services',
    links: [
      { href: '/performers?category=musicians', label: 'Musicians' },
      { href: '/performers?category=dancers', label: 'Dancers' },
      { href: '/performers?category=comedians', label: 'Comedians' },
      { href: '/performers?category=magicians', label: 'Magicians' },
      { href: '/performers?category=djs', label: 'DJs' },
      { href: '/services', label: 'All Services' }
    ]
  },
  company: {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/vetting/apply', label: 'Become a Performer' },
      { href: '/safety', label: 'Safety & Vetting' },
      { href: '/blog', label: 'Blog' },
      { href: '/careers', label: 'Careers' }
    ]
  },
  support: {
    title: 'Support',
    links: [
      { href: '/contact', label: 'Contact Us' },
      { href: '/faq', label: 'FAQ' },
      { href: '/help', label: 'Help Center' },
      { href: '/booking-guide', label: 'Booking Guide' },
      { href: '/cancellation', label: 'Cancellation Policy' }
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookie-policy', label: 'Cookie Policy' },
      { href: '/disclaimer', label: 'Disclaimer' }
    ]
  }
};

const trustFeatures = [
  {
    icon: Shield,
    title: 'Vetted Performers',
    description: 'Background checked & verified'
  },
  {
    icon: Star,
    title: '5-Star Service',
    description: 'Top-rated professionals'
  },
  {
    icon: Users,
    title: '1000+ Events',
    description: 'Successfully delivered'
  },
  {
    icon: Heart,
    title: 'Perth & WA',
    description: 'Local expertise'
  }
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t">
      {/* Trust Features Bar - Mobile Optimized */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="text-center">
                <feature.icon className="w-6 h-6 mx-auto mb-2 fill-current" />
                <h3 className="font-semibold text-sm md:text-base">{feature.title}</h3>
                <p className="text-xs md:text-sm opacity-90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section - Mobile First */}
      <NewsletterSection />

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Flavor
                  </span>
                  <span className="text-sm text-muted-foreground leading-none">
                    Entertainers
                  </span>
                </div>
              </Link>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Australia's premier platform for booking vetted professional performers.
                Creating unforgettable experiences across Perth and Western Australia since 2024.
              </p>

              {/* Contact Info - Mobile Optimized */}
              <div className="space-y-3">
                <a
                  href="tel:+61800123456"
                  className="flex items-center space-x-3 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>1800 FLAVOR (1800 352 867)</span>
                </a>
                <a
                  href="mailto:hello@flavor-entertainers.com.au"
                  className="flex items-center space-x-3 text-sm hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>hello@flavor-entertainers.com.au</span>
                </a>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Perth, Western Australia</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Mon-Fri 9AM-6PM, Sat 10AM-4PM</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4 mt-6">
                <a
                  href="https://instagram.com/flavorentertainers"
                  className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/flavorentertainers"
                  className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/flavorent"
                  className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>© 2024 Flavor Entertainers. All rights reserved.</p>
              <p className="mt-1">
                ABN: 12 345 678 901 | Licensed Entertainment Provider
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>24/7 Booking</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="p-2"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}