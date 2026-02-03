'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';
import BookingModal from '@/components/booking/BookingModal';
import { Service } from '@/lib/content-manager';

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const services = await res.json();
          const found = services.find((s: Service) => s.id === params.id);
          if (found) {
            setService(found);
          }
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
        <p className="text-gray-600 mb-8">The service you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/services"
          className="inline-flex items-center text-pink-500 hover:text-pink-600 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <Link
          href="/services"
          className="inline-flex items-center text-gray-600 hover:text-pink-500 mb-8 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Services
        </Link>

        {/* Service Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-12 text-white">
            {service.popular && (
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                Popular Service
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{service.name}</h1>
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center">
                <FiClock className="mr-2" />
                <span>{service.duration}</span>
              </div>
              <div className="flex items-center">
                <FiDollarSign className="mr-2" />
                <span className="text-2xl font-bold">${service.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Service</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              {service.description || 'Experience our professional lash service designed to enhance your natural beauty. Our skilled technicians use premium materials and techniques to deliver stunning results.'}
            </p>

            {/* What to Expect */}
            <div className="bg-pink-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">What to Expect</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  Professional consultation to understand your preferences
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  Premium quality lash materials
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  Relaxing, comfortable experience
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  Aftercare instructions provided
                </li>
              </ul>
            </div>

            {/* Book Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors"
              >
                <FiCalendar className="mr-2" />
                Book This Service
              </button>
              <Link
                href="/services"
                className="flex-1 inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-pink-300 hover:text-pink-500 transition-colors"
              >
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {service && (
        <BookingModal
          service={service}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </div>
  );
}
