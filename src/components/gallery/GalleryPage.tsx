'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  before?: string;
  after?: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: 'https://picsum.photos/600/800?random=40',
    alt: 'Classic Volume Lashes',
    category: 'Classic Lashes',
    before: 'https://picsum.photos/300/400?random=41',
    after: 'https://picsum.photos/300/400?random=42'
  },
  {
    id: 2,
    src: 'https://picsum.photos/600/800?random=43',
    alt: 'Mega Volume Transformation',
    category: 'Volume Lashes'
  },
  {
    id: 3,
    src: 'https://picsum.photos/600/800?random=44',
    alt: 'Hybrid Lash Set',
    category: 'Hybrid Lashes'
  },
  {
    id: 4,
    src: 'https://picsum.photos/600/800?random=45',
    alt: 'Natural Classic Look',
    category: 'Classic Lashes'
  },
  {
    id: 5,
    src: 'https://picsum.photos/600/800?random=46',
    alt: 'Dramatic Volume',
    category: 'Volume Lashes',
    before: 'https://picsum.photos/300/400?random=47',
    after: 'https://picsum.photos/300/400?random=48'
  },
  {
    id: 6,
    src: 'https://picsum.photos/600/800?random=49',
    alt: 'Cat Eye Effect',
    category: 'Specialty Lashes'
  },
  {
    id: 7,
    src: 'https://picsum.photos/600/800?random=50',
    alt: 'Lash Lift Results',
    category: 'Lash Lift'
  },
  {
    id: 8,
    src: 'https://picsum.photos/600/800?random=51',
    alt: 'Textured Hybrid',
    category: 'Hybrid Lashes'
  },
  {
    id: 9,
    src: 'https://picsum.photos/600/800?random=52',
    alt: 'Full Volume Set',
    category: 'Volume Lashes'
  },
  {
    id: 10,
    src: 'https://picsum.photos/600/800?random=53',
    alt: 'Wispy Classic',
    category: 'Classic Lashes'
  },
  {
    id: 11,
    src: 'https://picsum.photos/600/800?random=54',
    alt: 'Mega Volume Drama',
    category: 'Volume Lashes'
  },
  {
    id: 12,
    src: 'https://picsum.photos/600/800?random=55',
    alt: 'Natural Enhancement',
    category: 'Classic Lashes'
  }
];

const categories = ['All', 'Classic Lashes', 'Volume Lashes', 'Hybrid Lashes', 'Specialty Lashes', 'Lash Lift'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredImages = galleryImages.filter(image => 
    selectedCategory === 'All' || image.category === selectedCategory
  );

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
    setCurrentIndex(filteredImages.findIndex(img => img.id === image.id));
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + filteredImages.length) % filteredImages.length
      : (currentIndex + 1) % filteredImages.length;
    
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-pink-50 to-pink-100 page-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-8">Our Gallery</h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Discover the beautiful transformations our clients achieve with our premium eyelash extension services. 
              Each image showcases the artistry and skill of our certified technicians.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-8"></div>

      {/* Filter Tabs */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto"
          >
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => openModal(image)}
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                        <p className="font-medium">{image.alt}</p>
                        <p className="text-sm text-gray-200">{image.category}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          <div className="text-center mt-12 text-gray-600">
            Showing {filteredImages.length} of {galleryImages.length} images
          </div>

          {/* Bottom Spacer */}
          <div className="py-12"></div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <FiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Content */}
              <div className="flex flex-col lg:flex-row">
                <div className="relative flex-1 aspect-[3/4] lg:aspect-auto">
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Image Info */}
                <div className="p-6 lg:w-80">
                  <h3 className="text-2xl font-serif font-bold mb-2">{selectedImage.alt}</h3>
                  <p className="text-pink-600 font-medium mb-4">{selectedImage.category}</p>
                  
                  {/* Before/After if available */}
                  {selectedImage.before && selectedImage.after && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Before & After</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Before</p>
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                            <Image
                              src={selectedImage.before}
                              alt="Before"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">After</p>
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                            <Image
                              src={selectedImage.after}
                              alt="After"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-full font-medium transition-colors">
                      Book Similar Style
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
