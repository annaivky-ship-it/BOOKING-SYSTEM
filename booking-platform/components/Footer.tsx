import Link from 'next/link';
import { Heart, Shield, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold bg-gradient-magenta bg-clip-text text-transparent mb-4">
              BookingPro
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Australia's premier booking platform for freelancers and event staff.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-magenta-500 fill-magenta-500" />
              <span>in Perth, WA</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-magenta-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/performers" className="text-gray-400 hover:text-magenta-500 transition-colors">
                  Browse Performers
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-magenta-500 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-magenta-500" />
                Secure Payments
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-magenta-500" />
                ID Verification
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-magenta-500" />
                Real-time Updates
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-magenta-500" />
                <a href="mailto:support@bookingpro.com.au" className="hover:text-magenta-500 transition-colors">
                  support@bookingpro.com.au
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-magenta-500" />
                <a href="tel:+61412345678" className="hover:text-magenta-500 transition-colors">
                  +61 412 345 678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div>
            © {currentYear} BookingPro. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-magenta-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-magenta-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-magenta-500 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Built with Next.js 15, Supabase, Tailwind CSS & Twilio WhatsApp
        </div>
      </div>
    </footer>
  );
}
