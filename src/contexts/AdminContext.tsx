'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = Cookies.get('admin_token');
    if (token) {
      // Verify token with API
      fetch('/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            Cookies.remove('admin_token');
          }
        })
        .catch(() => {
          Cookies.remove('admin_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        Cookies.set('admin_token', data.token, { expires: 7 });
        setUser(data.user);
        toast.success('Logged in successfully!');
        router.push('/admin');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    Cookies.remove('admin_token');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <AdminContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAdmin: !!user
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
