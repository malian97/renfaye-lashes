'use client';

import dynamic from 'next/dynamic';
import { CartProvider } from '@/contexts/CartContext';

// Dynamically import components that need client-side rendering
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });
const CartSidebar = dynamic(() => import('@/components/cart/CartSidebar'), { ssr: false });

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <CartSidebar />
    </CartProvider>
  );
}
