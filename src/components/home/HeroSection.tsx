'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-pink-600/30 z-10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-pink-100/50"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20 text-gray-900 pt-32 pb-16 page-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold mb-8 leading-tight tracking-tight">
            Enhance Your
            <br />
            Natural Beauty
          </h1>
          <p className="text-xl sm:text-2xl mb-10 text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Premium eyelash extensions that make you feel confident and glamorous. 
            Experience the luxury of perfectly crafted lashes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/services"
              className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-5 rounded-full font-semibold transition-all duration-300 text-center text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Book Appointment
            </Link>
            <Link
              href="/gallery"
              className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-10 py-5 rounded-full font-semibold transition-all duration-300 text-center text-lg hover:shadow-xl transform hover:scale-105"
            >
              View Gallery
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <svg
            className="w-8 h-8 text-pink-500"
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
