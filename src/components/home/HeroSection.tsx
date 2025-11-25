'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { contentManager } from '@/lib/content-manager';

export default function HeroSection() {
  const [content, setContent] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      const siteContent = await contentManager.getSiteContent();
      setContent(siteContent);
      console.log('Hero content loaded:', siteContent.hero);
    };
    loadContent();
  }, []);

  useEffect(() => {
    if (!content?.hero?.slideshowImages) return;
    
    const validImages = content.hero.slideshowImages.filter((img: string) => img && img.trim() !== '');
    if (validImages.length <= 1) {
      console.log('Not enough images for slideshow:', validImages.length);
      return;
    }

    console.log(`Starting slideshow with ${validImages.length} images`);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const next = (prev + 1) % validImages.length;
        console.log(`Transitioning from slide ${prev} to ${next}`);
        return next;
      });
    }, 5000); // Change image every 5 seconds

    return () => {
      console.log('Stopping slideshow');
      clearInterval(interval);
    };
  }, [content]);

  if (!content) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </section>
    );
  }

  const images = content.hero.slideshowImages && content.hero.slideshowImages.length > 0 
    ? content.hero.slideshowImages.filter((img: string) => img && img.trim() !== '')
    : [content.hero.backgroundImage];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={`slide-${currentImageIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImageIndex]}
              alt={`Hero background ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority={currentImageIndex === 0}
              quality={90}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20 text-white pt-32 pb-16 page-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold mb-8 leading-tight tracking-tight drop-shadow-2xl">
            {content.hero.title}
          </h1>
          <p className="text-xl sm:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            {content.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href={content.hero.ctaLink}
              className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-5 rounded-full font-semibold transition-all duration-300 text-center text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {content.hero.ctaText}
            </Link>
            <Link
              href="/gallery"
              className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-10 py-5 rounded-full font-semibold transition-all duration-300 text-center text-lg hover:shadow-xl transform hover:scale-105"
            >
              View Gallery
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Slideshow indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {images.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
