'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { contentManager } from '@/lib/content-manager';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
  service: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      const siteContent = await contentManager.getSiteContent();
      setTestimonials(siteContent.testimonials || []);
    };
    loadContent();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, [testimonials]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-pink-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-6 sm:mb-8 text-gray-900">What Our Clients Say</h2>
          <p className="text-gray-700 text-sm sm:text-base max-w-3xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our satisfied clients have to say about their experience with RENFAYE LASHES.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial: Testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg text-center">
                    <div className="flex justify-center mb-4 sm:mb-6">
                      {[...Array(testimonial.rating)].map((_: any, i: number) => (
                        <FiStar key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <blockquote className="text-sm sm:text-base lg:text-lg text-gray-700 mb-4 sm:mb-6 italic leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </blockquote>
                    
                    <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{testimonial.location}</p>
                        <p className="text-xs sm:text-sm text-pink-500 font-medium">{testimonial.service}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Hidden on mobile */}
          <button
            onClick={prevTestimonial}
            className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 hover:text-pink-500 hover:bg-pink-50"
          >
            <FiChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 hover:text-pink-500 hover:bg-pink-50"
          >
            <FiChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6 sm:mt-8">
            {testimonials.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
