'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiAward, FiHeart, FiUsers, FiStar, FiTarget, FiEye } from 'react-icons/fi';

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
    icon: FiStar,
    number: '4.9/5',
    label: 'Average Rating',
    description: 'From verified reviews'
  }
];

const team = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Founder & Lead Technician',
    image: 'https://picsum.photos/300/400?random=60',
    bio: 'With over 8 years of experience in the beauty industry, Sarah founded RENFAYE LASHES with a vision to provide premium eyelash extension services.',
    certifications: ['Certified Lash Artist', 'Volume Lash Specialist', 'Lash Lift Certified']
  },
  {
    id: 2,
    name: 'Emily Chen',
    role: 'Senior Lash Technician',
    image: 'https://picsum.photos/300/400?random=61',
    bio: 'Emily specializes in volume and mega volume techniques, creating stunning dramatic looks while maintaining the health of natural lashes.',
    certifications: ['Volume Lash Expert', 'Classic Lash Certified', 'Hybrid Specialist']
  },
  {
    id: 3,
    name: 'Maria Rodriguez',
    role: 'Lash Artist & Trainer',
    image: 'https://picsum.photos/300/400?random=62',
    bio: 'Maria combines her artistic background with technical expertise to create beautiful, customized lash looks for each client.',
    certifications: ['Master Lash Artist', 'Lash Trainer', 'Color Theory Certified']
  }
];

const values = [
  {
    icon: FiEye,
    title: 'Excellence',
    description: 'We strive for perfection in every lash application, using only the finest materials and latest techniques.'
  },
  {
    icon: FiHeart,
    title: 'Care',
    description: 'Your comfort and satisfaction are our top priorities. We provide a relaxing, luxurious experience.'
  },
  {
    icon: FiTarget,
    title: 'Innovation',
    description: 'We stay current with the latest trends and techniques to offer you the most advanced lash services.'
  }
];

export default function AboutPage() {
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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-8">About RENFAYE LASHES</h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto">
              Founded with a passion for enhancing natural beauty, RENFAYE LASHES has become a trusted name in premium eyelash extensions. We believe that every woman deserves to feel confident and beautiful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-full font-medium transition-colors">
                Book Consultation
              </button>
              <button className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-8 py-4 rounded-full font-medium transition-colors">
                View Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </motion.div>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
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
      <section className="py-20 bg-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">Experience the RENFAYE Difference</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied clients who trust us with their lash needs. Book your appointment today and discover why we&apos;re the premier choice for eyelash extensions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <button className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-colors duration-300">
              Book Now
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
