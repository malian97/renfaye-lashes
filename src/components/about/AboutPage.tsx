'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiAward, FiHeart, FiUsers, FiStar, FiTarget, FiEye } from 'react-icons/fi';
import { contentManager, SiteContent } from '@/lib/content-manager';

export default function AboutPage() {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      const data = await contentManager.getSiteContent();
      setContent(data);
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
    <div className="pb-16">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-pink-50 to-pink-100 page-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-8">{content.about.title}</h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto">
              {content.about.description}
            </p>
            {content.about.cta && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <Link href={content.about.cta.primaryButtonLink}>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-full font-medium transition-colors w-full sm:w-auto">
                    {content.about.cta.primaryButtonText}
                  </button>
                </Link>
                <Link href={content.about.cta.secondaryButtonLink}>
                  <button className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-8 py-4 rounded-full font-medium transition-colors w-full sm:w-auto">
                    {content.about.cta.secondaryButtonText}
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.about.stats.map((stat, index) => {
              const icons = [FiUsers, FiAward, FiHeart, FiStar];
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
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                  <p className="font-semibold text-gray-900 mb-1">{stat.label}</p>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and ensure that every client receives the exceptional service they deserve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.about.values && content.about.values.map((value, index) => {
              const icons = [FiEye, FiHeart, FiTarget];
              const Icon = icons[index % icons.length];
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our certified lash artists are passionate professionals dedicated to creating beautiful results while prioritizing the health of your natural lashes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.about.team && content.about.team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-80">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-pink-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">Certifications:</p>
                    {member.certifications.map((cert, idx) => (
                      <p key={idx} className="text-xs text-gray-600">• {cert}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* CTA Section */}
      {content.about.cta && (
        <section className="py-20 bg-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-serif font-bold mb-6">{content.about.cta.title}</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {content.about.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
              <Link href={content.about.cta.primaryButtonLink}>
                <button className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-colors duration-300 w-full sm:w-auto">
                  {content.about.cta.primaryButtonText}
                </button>
              </Link>
              <Link href={content.about.cta.secondaryButtonLink}>
                <button className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 py-4 rounded-full font-medium transition-colors duration-300 w-full sm:w-auto">
                  {content.about.cta.secondaryButtonText}
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Spacer */}
      <div className="py-12"></div>
    </div>
  );
}
