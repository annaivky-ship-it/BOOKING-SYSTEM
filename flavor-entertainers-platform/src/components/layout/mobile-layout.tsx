'use client';

import { ReactNode } from 'react';
import { GlobalNav } from '@/components/navigation/global-nav';
import { Footer } from '@/components/layout/footer';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
  showFooter?: boolean;
}

export function MobileLayout({
  children,
  className = '',
  showNav = true,
  showFooter = true
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showNav && <GlobalNav />}

      <main className={`flex-1 ${className}`}>
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}