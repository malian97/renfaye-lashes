'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CartProvider } from '@/contexts/CartContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from 'react-hot-toast';

// Dynamically import components that need client-side rendering
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });
const CartSidebar = dynamic(() => import('@/components/cart/CartSidebar'), { ssr: false });

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <AdminProvider>
      <UserProvider>
        <CartProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          {!isAdminRoute && <Header />}
          <main className="flex-grow">
            {children}
          </main>
          {!isAdminRoute && <Footer />}
          <CartSidebar />
        </CartProvider>
      </UserProvider>
    </AdminProvider>
  );
}
