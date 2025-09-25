'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
  service: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, NY",
    rating: 5,
    text: "Absolutely amazing! The lashes look so natural and beautiful. I&apos;ve been getting compliments non-stop. The service was professional and the results exceeded my expectations.",
    image: "https://picsum.photos/150/150?random=15",
    service: "Classic Volume Lashes"
  },
  {
    id: 2,
    name: "Emily Chen",
    location: "Los Angeles, CA",
    rating: 5,
    text: "Best lash experience I&apos;ve ever had! The attention to detail is incredible. My lashes have lasted for weeks and still look perfect. Highly recommend RENFAYE LASHES!",
    image: "https://picsum.photos/150/150?random=16",
    service: "Hybrid Volume Set"
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    location: "Miami, FL",
    rating: 5,
    text: "I&apos;m obsessed with my new lashes! They make me feel so confident and glamorous. The team is so skilled and made the whole process comfortable and relaxing.",
    image: "https://picsum.photos/150/150?random=17",
    service: "Mega Volume Set"
  },
  {
    id: 4,
    name: "Jessica Williams",
    location: "Chicago, IL",
    rating: 5,
    text: "The quality is unmatched! I&apos;ve tried other places but nothing compares to RENFAYE LASHES. The lashes are lightweight, comfortable, and look absolutely stunning.",
    image: "https://picsum.photos/150/150?random=18",
    service: "Classic Volume Lashes"
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-3 sm:mb-4 text-gray-900">What Our Clients Say</h2>
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
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg text-center">
                    <div className="flex justify-center mb-4 sm:mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
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
                        <p className="text-xs sm:text-sm text-primary-500 font-medium">{testimonial.service}</p>
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
            className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 hover:text-primary-500 hover:bg-primary-50"
          >
            <FiChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 lg:p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 hover:text-primary-500 hover:bg-primary-50"
          >
            <FiChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6 sm:mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
