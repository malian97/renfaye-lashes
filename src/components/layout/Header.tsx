'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
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
            <div className="relative w-12 h-12 lg:w-16 lg:h-16">
              <Image
                src="/images/logo.jpeg"
                alt="RENFAYE LASHES"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="ml-3 text-lg lg:text-xl font-bold font-serif text-gray-900 hidden sm:block">
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
            <button className="hidden lg:flex p-3 text-gray-700 hover:text-pink-500 transition-colors">
              <FiUser className="w-6 h-6" />
            </button>
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
