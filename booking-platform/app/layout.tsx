import type { Metadata } from 'next';
import './globals.css';

// Using system fonts instead of Google Fonts for better performance and reliability

export const metadata: Metadata = {
  title: 'Booking Platform',
  description: 'Professional booking platform for freelancers and private-event staff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
