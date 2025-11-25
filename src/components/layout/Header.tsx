'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiLogOut, FiSettings } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { state, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Policy', href: '/policy' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 mr-8">
            <div className="relative w-16 h-16 lg:w-20 lg:h-20">
              <Image
                src="/images/logo.jpeg"
                alt="RENFAYE LASHES"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="ml-3 text-xl lg:text-3xl font-bold font-serif text-gray-900 hidden sm:block">
              RENFAYE LASHES
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-gray-700 hover:text-pink-500 transition-colors duration-200 py-2 px-1"
                  style={{ color: '#374151' }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-6 ml-8">
            <button className="hidden lg:flex p-3 text-gray-700 hover:text-pink-500 transition-colors">
              <FiSearch className="w-6 h-6" />
            </button>
            
            {/* User Menu */}
            <div className="hidden lg:block relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-3 text-gray-700 hover:text-pink-500 transition-colors"
              >
                <FiUser className="w-6 h-6" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiSettings className="mr-3" />
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="mr-3" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={toggleCart}
              className="p-3 text-gray-700 hover:text-pink-500 transition-colors relative"
            >
              <FiShoppingCart className="w-6 h-6" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
                  {state.itemCount}
                </span>
              )}
            </button>
            <button 
              className="lg:hidden p-3 text-gray-700 hover:text-pink-500 transition-colors ml-4"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white shadow-xl border-t border-gray-200">
            <nav className="py-8">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-8 py-5 text-xl font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    borderBottom: index < navLinks.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                >
                  {link.name}
                </Link>
              ))}
              {/* Mobile-only search and user buttons */}
              <div className="flex items-center justify-center space-x-12 pt-8 border-t border-gray-200 mt-6">
                <button className="flex flex-col items-center space-y-3 text-gray-700 hover:text-pink-500 transition-colors p-4">
                  <FiSearch className="w-7 h-7" />
                  <span className="text-base font-medium">Search</span>
                </button>
                <button className="flex flex-col items-center space-y-3 text-gray-700 hover:text-pink-500 transition-colors p-4">
                  <FiUser className="w-7 h-7" />
                  <span className="text-base font-medium">Account</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
