'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiAward, FiHeart, FiUsers, FiTrendingUp } from 'react-icons/fi';

const stats = [
  {
    icon: FiUsers,
    number: '5000+',
    label: 'Happy Clients',
    description: 'Satisfied customers worldwide'
  },
  {
    icon: FiAward,
    number: '8+',
    label: 'Years Experience',
    description: 'In the beauty industry'
  },
  {
    icon: FiHeart,
    number: '99%',
    label: 'Client Satisfaction',
    description: 'Based on customer reviews'
  },
  {
    icon: FiTrendingUp,
    number: '50+',
    label: 'Lash Styles',
    description: 'Premium options available'
  }
];

const features = [
  {
    title: 'Premium Quality Materials',
    description: 'We use only the finest silk and mink lashes, sourced from trusted suppliers to ensure comfort and longevity.',
    image: 'https://picsum.photos/400/300?random=12'
  },
  {
    title: 'Expert Technicians',
    description: 'Our certified lash artists have years of experience and undergo continuous training to master the latest techniques.',
    image: 'https://picsum.photos/400/300?random=13'
  },
  {
    title: 'Personalized Service',
    description: 'Every client receives a customized consultation to determine the perfect lash style for their unique eye shape and preferences.',
    image: 'https://picsum.photos/400/300?random=14'
  }
];

export default function AboutSection() {
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-4 sm:mb-6">Why Choose RENFAYE LASHES?</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              With over 8 years of experience in the beauty industry, we&apos;ve perfected the art of eyelash extensions. 
              Our certified technicians use only premium materials and the latest techniques to ensure your lashes 
              look natural, feel comfortable, and last longer.
            </p>
            <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              Every client receives a personalized consultation to determine the perfect lash style for their 
              unique eye shape and lifestyle. We&apos;re committed to enhancing your natural beauty while maintaining 
              the health of your natural lashes.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-500 mb-2">{stat.number}</h3>
                  <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">{stat.label}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-40 sm:h-48">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
