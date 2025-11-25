'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { contentManager } from '@/lib/content-manager';

export default function SizeGuidePage() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      const siteContent = await contentManager.getSiteContent();
      setContent(siteContent.sizeGuide);
    };
    loadContent();
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-pink-50 to-pink-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-8">
              {content.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Length Guide */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">Lash Length Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {content.lengths.map((length: any, index: number) => (
              <motion.div
                key={length.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-8"
              >
                <h3 className="text-2xl font-semibold mb-4 text-pink-600">
                  {length.title} ({length.range})
                </h3>
                <p className="text-gray-600 mb-4">
                  {length.description}
                </p>
                <ul className="space-y-2 text-gray-600">
                  {length.features.map((feature: string, idx: number) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Volume Guide */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">Volume Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.volumes.map((volume: any, index: number) => (
              <motion.div
                key={volume.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: (index % 2) * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-md"
              >
                <h3 className="text-2xl font-semibold mb-4">{volume.title}</h3>
                <p className="text-gray-600 mb-4">
                  {volume.description}
                </p>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Best For:</h4>
                  <ul className="space-y-1 text-gray-600">
                    {volume.bestFor.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curl Guide */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">Curl Types</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {content.curls.map((curl: any, index: number) => (
              <motion.div
                key={curl.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-pink-50 rounded-xl p-6 text-center"
              >
                <h3 className="text-3xl font-bold mb-2 text-pink-600">{curl.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{curl.type}</p>
                <p className="text-gray-600">
                  {curl.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="py-20 bg-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {content.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={content.cta.primaryButtonLink}
              className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-colors"
            >
              {content.cta.primaryButtonText}
            </Link>
            <Link
              href={content.cta.secondaryButtonLink}
              className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 py-4 rounded-full font-medium transition-colors"
            >
              {content.cta.secondaryButtonText}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
