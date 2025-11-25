'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiHeart, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { contentManager } from '@/lib/content-manager';

export default function AboutSection() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      const siteContent = await contentManager.getSiteContent();
      setContent(siteContent);
    };
    loadContent();
  }, []);

  if (!content) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </section>
    );
  }

  const icons = [FiUsers, FiAward, FiHeart, FiTrendingUp];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main About Content */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-4 sm:mb-6">{content.about.title}</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              {content.about.description}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {content.about.stats.map((stat: any, index: number) => {
                const Icon = icons[index % icons.length];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-500 mb-2">{stat.number}</h3>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">{stat.label}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {content.about.values && content.about.values.map((value: any, index: number) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{value.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
