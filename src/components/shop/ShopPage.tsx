'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiFilter, FiGrid, FiList, FiStar } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Classic Volume Lashes',
    price: 49.99,
    image: 'https://picsum.photos/400/500?random=2',
    category: 'Volume Lashes',
    rating: 4.9,
    reviewCount: 127,
    isBestSeller: true,
  },
  {
    id: 2,
    name: 'Hybrid Volume Set',
    price: 59.99,
    image: 'https://picsum.photos/400/500?random=5',
    category: 'Hybrid Lashes',
    rating: 4.8,
    reviewCount: 89,
    isNew: true,
  },
  {
    id: 3,
    name: 'Mega Volume Set',
    price: 69.99,
    image: 'https://picsum.photos/400/500?random=8',
    category: 'Volume Lashes',
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: 4,
    name: 'Natural Classic Lashes',
    price: 39.99,
    originalPrice: 49.99,
    image: 'https://picsum.photos/400/500?random=20',
    category: 'Classic Lashes',
    rating: 4.7,
    reviewCount: 98,
  },
  {
    id: 5,
    name: 'Dramatic Volume Lashes',
    price: 79.99,
    image: 'https://picsum.photos/400/500?random=21',
    category: 'Volume Lashes',
    rating: 4.8,
    reviewCount: 134,
    isNew: true,
  },
  {
    id: 6,
    name: 'Cat Eye Lashes',
    price: 54.99,
    image: 'https://picsum.photos/400/500?random=22',
    category: 'Specialty Lashes',
    rating: 4.6,
    reviewCount: 76,
  },
];

const categories = ['All', 'Classic Lashes', 'Volume Lashes', 'Hybrid Lashes', 'Specialty Lashes'];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const { addItem } = useCart();

  const filteredProducts = products.filter(product => 
    selectedCategory === 'All' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
            : 'space-y-4 sm:space-y-6'
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
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Quick Add Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4 lg:p-6">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-white text-gray-900 py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className={`p-3 sm:p-4 lg:p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <span className="text-xs sm:text-sm text-primary-600 font-medium">{product.category}</span>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mt-1 mb-2 line-clamp-2">
                  <Link href={`/products/${product.id}`} className="hover:text-primary-600 transition-colors">
                    {product.name}
                  </Link>
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2 sm:mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">({product.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg font-bold">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-xs sm:text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="py-8"></div>

        {/* Results Count */}
        <div className="mt-12 text-center text-gray-600">
          Showing {sortedProducts.length} of {products.length} products
        </div>

        {/* Bottom Spacer */}
        <div className="py-12"></div>
      </div>
    </div>
  );
}
