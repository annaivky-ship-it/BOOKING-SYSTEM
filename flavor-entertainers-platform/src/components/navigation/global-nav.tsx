'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Star,
  Shield,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  badge?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { href: '/', label: 'Home' },
  {
    href: '/performers',
    label: 'Performers',
    children: [
      { href: '/performers?category=musicians', label: 'Musicians' },
      { href: '/performers?category=dancers', label: 'Dancers' },
      { href: '/performers?category=comedians', label: 'Comedians' },
      { href: '/performers?category=magicians', label: 'Magicians' },
      { href: '/performers?category=djs', label: 'DJs' },
    ]
  },
  { href: '/services', label: 'Services' },
  { href: '/vetting/apply', label: 'Apply', badge: 'Performer' },
  { href: '/contact', label: 'Contact' },
];

const trustFeatures = [
  {
    icon: Shield,
    title: 'Vetted Performers',
    description: 'All performers undergo background checks'
  },
  {
    icon: Star,
    title: '5-Star Rated',
    description: 'Top-rated professionals in Perth & WA'
  },
  {
    icon: Users,
    title: '1000+ Events',
    description: 'Successfully booked across Australia'
  }
];

export function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Trust bar - mobile first */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Vetted Performers</span>
              <span className="sm:hidden">Vetted</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">5-Star Rated</span>
              <span className="sm:hidden">5-Star</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Perth & WA</span>
              <span className="sm:hidden">Perth/WA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200',
          isScrolled && 'shadow-md'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Flavor
                </span>
                <span className="text-xs text-muted-foreground leading-none">
                  Entertainers
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.children && <ChevronDown className="w-3 h-3 ml-1" />}
                  </Link>

                  {/* Dropdown for children */}
                  {item.children && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" asChild>
                <Link href="/performers">Book Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-white fill-current" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg leading-none bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                          Flavor
                        </span>
                        <span className="text-xs text-muted-foreground leading-none">
                          Entertainers
                        </span>
                      </div>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <div className="space-y-1">
                      {navigationItems.map((item) => (
                        <div key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center justify-between w-full px-3 py-3 rounded-lg text-base font-medium transition-colors',
                              isActive(item.href)
                                ? 'text-primary bg-primary/10'
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            )}
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>

                          {/* Mobile children */}
                          {item.children && (
                            <div className="ml-4 mt-1 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setIsOpen(false)}
                                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </nav>

                  {/* Mobile Trust Features */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">Why Choose Us?</h3>
                    <div className="space-y-3">
                      {trustFeatures.map((feature) => (
                        <div key={feature.title} className="flex items-start space-x-3">
                          <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile CTA */}
                  <div className="border-t pt-6 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/performers">Book Performers</Link>
                    </Button>
                  </div>

                  {/* Mobile Contact */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                      <a href="tel:+61800123456" className="flex items-center space-x-1 hover:text-primary">
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </a>
                      <a href="mailto:hello@flavor-entertainers.com.au" className="flex items-center space-x-1 hover:text-primary">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </a>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Perth, WA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}