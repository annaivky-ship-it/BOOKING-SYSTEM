'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/flavor-logo.svg"
            alt="Flavor Entertainers"
            width={220}
            height={50}
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/services" className="text-gray-300 hover:text-pink-400 transition-colors">
            Services
          </Link>
          <Link href="/performers" className="text-gray-300 hover:text-pink-400 transition-colors">
            Performers
          </Link>
          <Link href="#features" className="text-gray-300 hover:text-pink-400 transition-colors">
            Features
          </Link>
          <Link href="#about" className="text-gray-300 hover:text-pink-400 transition-colors">
            About
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/services"
              className="block text-gray-300 hover:text-pink-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/performers"
              className="block text-gray-300 hover:text-pink-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Performers
            </Link>
            <Link
              href="#features"
              className="block text-gray-300 hover:text-pink-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#about"
              className="block text-gray-300 hover:text-pink-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 space-y-2">
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}