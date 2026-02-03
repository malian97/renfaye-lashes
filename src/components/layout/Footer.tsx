'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaPinterest, FaTwitter } from 'react-icons/fa';

const footerLinks = [
  {
    title: 'Shop',
    links: [
      { name: 'All Products', href: '/shop' },
      { name: 'New Arrivals', href: '/shop?new-arrivals' },
      { name: 'Best Sellers', href: '/shop?best-sellers' },
      { name: 'Special Offers', href: '/shop?special-offers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/contact' },
    ],
  },
];

export default function Footer() {
  const [socialMedia, setSocialMedia] = useState({
    facebook: '#',
    instagram: '#',
    twitter: '#'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          if (settings.socialMedia) {
            setSocialMedia(settings.socialMedia);
          }
        }
      } catch (error) {
        console.error('Error loading social media settings:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="mb-8 md:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-serif font-bold mb-6">RENFAYE LASHES</h3>
            <p className="text-gray-400 mb-6">
              Premium eyelash extensions that enhance your natural beauty. 
              Discover the perfect lashes for a glamorous look that lasts.
            </p>
            <div className="flex space-x-4">
              {socialMedia.facebook && socialMedia.facebook !== '#' && socialMedia.facebook.trim() !== '' && (
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {socialMedia.instagram && socialMedia.instagram !== '#' && socialMedia.instagram.trim() !== '' && (
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
              {socialMedia.twitter && socialMedia.twitter !== '#' && socialMedia.twitter.trim() !== '' && (
                <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="mb-12">
              <h4 className="text-lg font-medium mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} RENFAYE LASHES. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/policy" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
