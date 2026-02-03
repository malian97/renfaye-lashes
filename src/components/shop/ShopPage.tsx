'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiGrid, FiList, FiStar } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { contentManager, Product, SiteContent } from '@/lib/content-manager';
import { calculateMemberProductPrice, MembershipBenefits } from '@/lib/membership-utils';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [membershipTiers, setMembershipTiers] = useState<SiteContent['membership']['tiers']>([]);
  const { addItem } = useCart();
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const [allProducts, siteContent] = await Promise.all([
        contentManager.getProducts(),
        contentManager.getSiteContent()
      ]);
      // Only show products that are in stock
      const availableProducts = allProducts.filter(p => p.inStock);
      setProducts(availableProducts);
      setMembershipTiers(siteContent.membership?.tiers || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user's membership benefits
  const getUserMembershipBenefits = (): MembershipBenefits | null => {
    if (!isAuthenticated || !user?.membership?.status || user.membership.status !== 'active') {
      return null;
    }
    const tier = membershipTiers.find(t => t.id === user.membership?.tierId);
    return tier?.benefits || null;
  };

  const memberBenefits = getUserMembershipBenefits();

  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const filteredProducts = products.filter(product => 
    selectedCategory === 'All' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  return (
    <div className="pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 text-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center page-hero">
            <h1 className="text-4xl lg:text-6xl font-serif font-bold mb-6">Shop Our Collection</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Discover our premium range of eyelash extensions and beauty products, carefully curated for the modern woman.
            </p>
          </div>
        </section>
        
        {/* Spacer */}
        <div className="py-12"></div>
        
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-pink-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No products found in this category</p>
            <p className="text-gray-500">Try selecting a different category or check back later</p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 lg:gap-10' 
              : 'space-y-6 sm:space-y-8'
          }`}>
            {sortedProducts.map((product) => (
            <div
              key={product.id}
              className={`group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Product Image */}
              <div className={`relative overflow-hidden ${
                viewMode === 'list' ? 'w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0' : 'h-48 sm:h-56 lg:h-64'
              }`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 space-y-1 sm:space-y-2">
                  {product.featured && (
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                  {product.bestSeller && (
                    <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Quick Add Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4 lg:p-6">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-white text-gray-900 py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-pink-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className={`p-3 sm:p-4 lg:p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <span className="text-xs sm:text-sm text-pink-600 font-medium">{product.category}</span>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mt-1 mb-2 line-clamp-2">
                  <Link href={`/products/${product.id}`} className="hover:text-pink-600 transition-colors">
                    {product.name}
                  </Link>
                </h3>
                
                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    {memberBenefits && memberBenefits.productDiscount > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-bold text-pink-600">
                            ${calculateMemberProductPrice(product.price, memberBenefits).price.toFixed(2)}
                          </span>
                          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full flex items-center">
                            <FiStar className="w-3 h-3 mr-1" />
                            {memberBenefits.productDiscount}% off
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-base sm:text-lg font-bold">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="text-pink-600 hover:text-pink-700 font-medium text-xs sm:text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Spacer */}
        <div className="py-12"></div>

        {/* Results Count */}
        <div className="mt-16 text-center text-gray-600">
          Showing {sortedProducts.length} of {products.length} products
        </div>

        {/* Bottom Spacer */}
        <div className="py-12"></div>
      </div>
    </div>
  );
}
