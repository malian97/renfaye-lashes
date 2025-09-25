import HeroSection from '@/components/home/HeroSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import AboutSection from '@/components/home/AboutSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function Home() {

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Spacer */}
      <div className="py-12"></div>

      {/* About Section */}
      <AboutSection />

      {/* Spacer */}
      <div className="py-12"></div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Spacer */}
      <div className="py-12"></div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-100 to-primary-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6 text-gray-900">Ready to Enhance Your Look?</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Book an appointment with our lash experts and experience the RENFAYE difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/book-now" 
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Book Now
            </a>
            <a 
              href="/services" 
              className="bg-white hover:bg-primary-50 text-primary-600 px-8 py-4 rounded-full font-medium transition-all duration-300 border-2 border-primary-300 hover:border-primary-400 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Our Services
            </a>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="py-12"></div>
    </div>
  );
}
