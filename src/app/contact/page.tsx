import ContactForm from '@/components/contact/ContactForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | RENFAYE LASHES',
  description: 'Get in touch with RENFAYE LASHES. Book your appointment or ask questions about our premium eyelash extension services.',
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-8">Contact Us</h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Ready to enhance your natural beauty? Get in touch with our expert team to book your appointment or ask any questions about our premium eyelash extension services.
          </p>
        </div>
        
        {/* Spacer */}
        <div className="py-8"></div>
        
        <ContactForm />
        
        {/* Bottom Spacer */}
        <div className="py-12"></div>
      </div>
    </div>
  );
}
