'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiLogOut, FiSettings } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ products: any[]; services: any[] }>({ products: [], services: [] });
  const [isSearching, setIsSearching] = useState(false);
  const { state, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    const lockScroll = () => {
      const body = document.body;
      const html = document.documentElement;
      const count = Number(body.dataset.scrollLockCount || '0');
      body.dataset.scrollLockCount = String(count + 1);
      if (count === 0) {
        body.style.overflow = 'hidden';
        html.style.overflow = 'hidden';
      }
    };

    const unlockScroll = () => {
      const body = document.body;
      const html = document.documentElement;
      const count = Number(body.dataset.scrollLockCount || '0');
      const nextCount = Math.max(0, count - 1);
      if (nextCount === 0) {
        delete body.dataset.scrollLockCount;
        body.style.overflow = '';
        html.style.overflow = '';
      } else {
        body.dataset.scrollLockCount = String(nextCount);
      }
    };

    if (!isMenuOpen) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isMenuOpen]);

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

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults({ products: [], services: [] });
      }
    };
    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isSearchOpen]);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ products: [], services: [] });
      return;
    }
    setIsSearching(true);
    try {
      const [productsRes, servicesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/services'),
      ]);
      const products = await productsRes.json();
      const services = await servicesRes.json();
      
      const lowerQuery = query.toLowerCase();
      const filteredProducts = products.filter((p: any) =>
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      
      const filteredServices = services.filter((s: any) =>
        s.name?.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery) ||
        s.category?.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      
      setSearchResults({ products: filteredProducts, services: filteredServices });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleSearchResultClick = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults({ products: [], services: [] });
    setIsMenuOpen(false);
    router.push(href);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
    { name: 'Membership', href: '/membership' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Policy', href: '/policy' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/90 lg:backdrop-blur-sm'
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
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex p-3 text-gray-700 hover:text-pink-500 transition-colors"
            >
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
          <div className="lg:hidden bg-white shadow-xl border-t border-gray-200 fixed inset-x-0 top-20 bottom-0 z-[60] overflow-y-auto">
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
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="flex flex-col items-center space-y-3 text-gray-700 hover:text-pink-500 transition-colors p-4"
                >
                  <FiSearch className="w-7 h-7" />
                  <span className="text-base font-medium">Search</span>
                </button>
                <Link
                  href={isAuthenticated ? '/account' : '/login'}
                  className="flex flex-col items-center space-y-3 text-gray-700 hover:text-pink-500 transition-colors p-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser className="w-7 h-7" />
                  <span className="text-base font-medium">Account</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div 
            className="bg-white w-full max-w-2xl mx-auto mt-20 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-gray-200 px-6 py-4">
              <FiSearch className="w-6 h-6 text-gray-400 mr-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products and services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-lg outline-none placeholder-gray-400"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  setSearchResults({ products: [], services: [] });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : searchQuery && (searchResults.products.length > 0 || searchResults.services.length > 0) ? (
                <div className="py-4">
                  {/* Products */}
                  {searchResults.products.length > 0 && (
                    <div className="mb-4">
                      <h3 className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        Products
                      </h3>
                      {searchResults.products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSearchResultClick(`/products/${product.id}`)}
                          className="w-full flex items-center px-6 py-3 hover:bg-pink-50 transition-colors text-left"
                        >
                          {product.image && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-4 flex-shrink-0">
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-500">${product.price?.toFixed(2)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Services */}
                  {searchResults.services.length > 0 && (
                    <div>
                      <h3 className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        Services
                      </h3>
                      {searchResults.services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleSearchResultClick(`/services/${service.id}`)}
                          className="w-full flex items-center px-6 py-3 hover:bg-pink-50 transition-colors text-left"
                        >
                          <div className="w-12 h-12 rounded-lg bg-pink-100 mr-4 flex-shrink-0 flex items-center justify-center">
                            <span className="text-pink-500 text-lg">✨</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{service.name}</p>
                            <p className="text-sm text-gray-500">
                              {service.duration} min • ${service.price?.toFixed(2)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : searchQuery ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No results found for &quot;{searchQuery}&quot;</p>
                  <p className="text-sm mt-2">Try searching for products or services</p>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <FiSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start typing to search...</p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Quick links</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSearchResultClick('/shop')}
                  className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:border-pink-300 hover:text-pink-500 transition-colors"
                >
                  All Products
                </button>
                <button
                  onClick={() => handleSearchResultClick('/services')}
                  className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:border-pink-300 hover:text-pink-500 transition-colors"
                >
                  All Services
                </button>
                <button
                  onClick={() => handleSearchResultClick('/membership')}
                  className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:border-pink-300 hover:text-pink-500 transition-colors"
                >
                  Membership
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
