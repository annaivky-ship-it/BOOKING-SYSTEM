import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'performer' | 'client';
  showFooter?: boolean;
}

export default function PageLayout({
  children,
  isAuthenticated,
  userRole,
  showFooter = true,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navigation isAuthenticated={isAuthenticated} userRole={userRole} />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
