import type { Metadata } from "next";
import { Inter, Playfair_Display } from 'next/font/google';
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'RENFAYE LASHES | Premium Eyelash Extensions',
  description: 'Discover luxury eyelash extensions that enhance your natural beauty. Shop our premium collection of lashes, designed for a glamorous look that lasts.',
  keywords: ['eyelash extensions', 'premium lashes', 'beauty', 'cosmetics', 'lash lift', 'RENFAYE LASHES'],
  authors: [{ name: 'RENFAYE LASHES' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://renfayelashes.com',
    title: 'RENFAYE LASHES | Premium Eyelash Extensions',
    description: 'Discover luxury eyelash extensions that enhance your natural beauty.',
    siteName: 'RENFAYE LASHES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RENFAYE LASHES',
    description: 'Premium Eyelash Extensions for a glamorous look that lasts.',
    creator: '@renfayelashes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
