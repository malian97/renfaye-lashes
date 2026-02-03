'use client';

import { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { contentManager } from '@/lib/content-manager';
import { getMembershipBenefits, calculateProductDiscount } from '@/lib/membership-utils';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  featured?: boolean;
};

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  benefits?: {
    productDiscount?: number;
    serviceDiscount?: number;
    pointsRate?: number;
    freeRefillsPerMonth?: number;
    freeFullSetsPerMonth?: number;
  };
}

export default function FeaturedProducts() {
  const { addItem } = useCart();
  const { user, isAuthenticated } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, siteContent] = await Promise.all([
          fetch('/api/products'),
          contentManager.getSiteContent()
        ]);
        
        if (productsRes.ok) {
          const data = await productsRes.json();
          const featured = data.filter((p: Product) => p.featured).slice(0, 3);
          setProducts(featured.length > 0 ? featured : data.slice(0, 3));
        }
        setMembershipTiers(siteContent.membership?.tiers || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUserBenefits = () => {
    if (!isAuthenticated || !user?.membership?.status || user.membership.status !== 'active') {
      return null;
    }
    return getMembershipBenefits(user.membership.tierId, membershipTiers);
  };

  const benefits = getUserBenefits();

  const handleAddToCart = (product: Product) => {
    addItem({
      ...product,
      id: parseInt(product.id) || 0,
      image: product.images?.[0] || product.image || ''
    });
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-6 sm:mb-8 text-gray-900">Our Signature Lashes</h2>
          <p className="text-gray-700 text-sm sm:text-base max-w-3xl mx-auto">
            Handcrafted with premium materials for a natural, flawless look that lasts.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {isLoading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-48 sm:h-56 lg:h-64 bg-gray-200" />
                <div className="p-3 sm:p-5 lg:p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))
          ) : products.map((product) => (
            <div key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                <Image
                  src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 sm:p-6">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-pink-500 text-white py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-pink-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-5 lg:p-6">
                <span className="text-xs sm:text-sm text-pink-600 font-medium">{product.category}</span>
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold mt-1 mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                  {benefits ? (
                    <div className="flex flex-col">
                      <span className="text-base sm:text-xl font-bold text-pink-600">
                        ${calculateProductDiscount(product.price, benefits).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base sm:text-xl font-bold">${product.price.toFixed(2)}</span>
                  )}
                  <Link 
                    href={`/products/${product.id}`}
                    className="text-gray-500 hover:text-pink-500 transition-colors p-1"
                  >
                    <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explicit spacer to separate grid from CTA button */}
        <div className="h-12 sm:h-16 lg:h-20"></div>

        <div className="text-center mt-0 pt-24 sm:pt-28">
          <Link 
            href="/shop" 
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
