'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiClock, FiDollarSign, FiCheck, FiCalendar } from 'react-icons/fi';

interface Service {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  features: string[];
  popular?: boolean;
}

const services: Service[] = [
  {
    id: 1,
    name: 'Classic Lashes',
    description: 'One extension applied to each natural lash for a natural, enhanced look.',
    duration: '2-2.5 hours',
    price: '$120-150',
    image: 'https://picsum.photos/600/400?random=30',
    features: [
      'Natural enhancement',
      'Perfect for everyday wear',
      'Lightweight and comfortable',
      'Lasts 4-6 weeks',
      'Suitable for all eye shapes'
    ]
  },
  {
    id: 2,
    name: 'Volume Lashes',
    description: 'Multiple lightweight extensions fanned and applied to each natural lash.',
    duration: '2.5-3 hours',
    price: '$180-220',
    image: 'https://picsum.photos/600/400?random=31',
    features: [
      'Dramatic, full look',
      'Customizable volume',
      'Ultra-lightweight',
      'Perfect for special events',
      'Lasts 5-7 weeks'
    ],
    popular: true
  },
  {
    id: 3,
    name: 'Hybrid Lashes',
    description: 'Perfect combination of classic and volume techniques for textured fullness.',
    duration: '2.5-3 hours',
    price: '$160-190',
    image: 'https://picsum.photos/600/400?random=32',
    features: [
      'Best of both worlds',
      'Textured, dimensional look',
      'Versatile styling',
      'Natural yet full',
      'Lasts 5-6 weeks'
    ]
  },
  {
    id: 4,
    name: 'Lash Lift & Tint',
    description: 'Curl and darken your natural lashes for a mascara-like effect.',
    duration: '1-1.5 hours',
    price: '$80-100',
    image: 'https://picsum.photos/600/400?random=33',
    features: [
      'No extensions needed',
      'Enhances natural lashes',
      'Low maintenance',
      'Waterproof results',
      'Lasts 6-8 weeks'
    ]
  },
  {
    id: 5,
    name: 'Lash Removal',
    description: 'Safe and gentle removal of existing lash extensions.',
    duration: '30-45 minutes',
    price: '$30-50',
    image: 'https://picsum.photos/600/400?random=34',
    features: [
      'Professional removal',
      'Protects natural lashes',
      'Gentle process',
      'Includes aftercare advice',
      'Prepares for new set'
    ]
  },
  {
    id: 6,
    name: 'Touch-Up/Fill',
    description: 'Maintain your lashes with regular fill appointments.',
    duration: '1-1.5 hours',
    price: '$60-90',
    image: 'https://picsum.photos/600/400?random=35',
    features: [
      'Maintains fullness',
      'Extends lash life',
      'Cost-effective',
      'Every 2-3 weeks',
      'Quick refresh'
    ]
  }
];

const processSteps = [
  {
    step: 1,
    title: 'Consultation',
    description: 'We discuss your desired look and assess your natural lashes to recommend the best service.'
  },
  {
    step: 2,
    title: 'Preparation',
    description: 'Your eyes are cleaned and prepared, with under-eye pads applied for comfort.'
  },
  {
    step: 3,
    title: 'Application',
    description: 'Each lash is carefully applied using professional techniques and premium materials.'
  },
  {
    step: 4,
    title: 'Final Check',
    description: 'We ensure perfect placement and provide aftercare instructions for long-lasting results.'
  }
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 page-hero">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-8 text-gray-900 leading-tight">
              Our Services
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Professional eyelash extension services designed to enhance your natural beauty. 
              Each service is performed by certified technicians using premium materials.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-medium px-3 py-1 rounded-full z-10">
                    Most Popular
                  </div>
                )}
                
                <div className="relative h-48">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-serif font-bold mb-3">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm">{service.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-pink-600 font-semibold">
                      <FiDollarSign className="w-4 h-4" />
                      <span>{service.price}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-full font-medium transition-colors duration-300 flex items-center justify-center space-x-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>Book Now</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Our Process</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Every appointment follows our proven process to ensure the best results and your complete satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* CTA Section */}
      <section className="py-20 bg-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Book your appointment today and let our expert technicians create the perfect lashes for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <button className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-colors duration-300">
              Book Appointment
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 py-4 rounded-full font-medium transition-colors duration-300">
              Free Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="py-12"></div>
    </div>
  );
}
