'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

interface NavigationProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'performer' | 'client';
}

export default function Navigation({ isAuthenticated, userRole }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold bg-gradient-magenta bg-clip-text text-transparent">
            BookingPro
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 transition-colors ${
                isActive('/') ? 'text-magenta-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link
              href="/performers"
              className={`flex items-center gap-2 transition-colors ${
                isActive('/performers') ? 'text-magenta-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Performers
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 transition-colors ${
                  isActive('/dashboard') ? 'text-magenta-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="btn-primary text-sm">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
