'use client';

import { motion } from 'framer-motion';
import { contentManager } from '@/lib/content-manager';
import { useEffect, useState } from 'react';

export default function PolicyPage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const sections = content.policy.sections;

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl lg:text-6xl font-bold font-serif text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {content.policy.title}
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {content.policy.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((section: any, index: number) => (
            <motion.div
              key={section.title}
              className="bg-white rounded-2xl shadow-lg p-8 lg:p-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-3xl font-bold font-serif text-gray-900 mb-8 pb-4 border-b-2 border-pink-500">
                {section.title}
              </h2>
              <div className="space-y-6">
                {section.content.map((item: any, itemIndex: number) => (
                  <div key={itemIndex}>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {item.subtitle}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold font-serif text-gray-900 mb-6">
              Questions About Our Policies?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              If you have any questions or concerns about our policies, please don't hesitate to contact us.
            </p>
            <a
              href="/contact"
              className="inline-block bg-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-600 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Last Updated: November 2025
          </p>
        </div>
      </section>
    </main>
  );
}
