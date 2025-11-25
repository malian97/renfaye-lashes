'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserData>) => Promise<boolean>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = Cookies.get('user_token');
    if (token) {
      // Verify token with API
      fetch('/api/user/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            Cookies.remove('user_token');
          }
        })
        .catch(() => {
          Cookies.remove('user_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        Cookies.set('user_token', data.token, { expires: 30 });
        setUser(data.user);
        toast.success('Welcome back!');
        return true;
      } else {
        toast.error(data.error || 'Invalid credentials');
        return false;
      }
    } catch {
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();

      if (res.ok && responseData.token) {
        Cookies.set('user_token', responseData.token, { expires: 30 });
        setUser(responseData.user);
        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(responseData.error || 'Registration failed');
        return false;
      }
    } catch {
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('user_token');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const updateProfile = async (updates: Partial<UserData>): Promise<boolean> => {
    try {
      const token = Cookies.get('user_token');
      if (!token) {
        toast.error('Please login first');
        return false;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        toast.success(data.message || 'Profile updated successfully');
        return true;
      } else {
        toast.error(data.error || 'Failed to update profile');
        return false;
      }
    } catch {
      toast.error('Failed to update profile');
      return false;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
