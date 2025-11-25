'use client';

import ContactForm from '@/components/contact/ContactForm';
import { contentManager } from '@/lib/content-manager';
import { useEffect, useState } from 'react';

export default function ContactPage() {
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
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Provide default values if fields are missing
  const contactInfo = {
    phone: content.contact.phone || '(555) 123-4567',
    email: content.contact.email || 'info@renfayelashes.com',
    address: content.contact.address || '123 Beauty Lane, Suite 100, New York, NY 10001',
    hours: content.contact.hours || 'Mon-Fri: 9:00 AM - 7:00 PM\nSat: 10:00 AM - 6:00 PM\nSun: Closed'
  };

  return (
    <div className="pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-8">{content.contact.title}</h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {content.contact.subtitle}
          </p>
        </div>
        
        {/* Contact Form with Contact Info */}
        <ContactForm contactInfo={contactInfo} />
        
        {/* Bottom Spacer */}
        <div className="py-12"></div>
      </div>
    </div>
  );
}
