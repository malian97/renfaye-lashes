'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheck, FiStar, FiAward, FiGift, FiPercent, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { contentManager, SiteContent } from '@/lib/content-manager';
import { useUser } from '@/contexts/UserContext';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const tierColors = [
  'from-pink-400 to-pink-500',
  'from-pink-500 to-pink-600',
  'from-pink-600 to-pink-700',
  'from-pink-700 to-pink-800',
];

const benefitIcons = [FiPercent, FiGift, FiStar, FiAward];

export default function MembershipPage() {
  const { user, isAuthenticated, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [content, setContent] = useState<SiteContent['membership'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const siteContent = await contentManager.getSiteContent();
        setContent(siteContent.membership);
      } catch (error) {
        console.error('Error loading membership content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleSubscribe = async (tierId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to subscribe');
      router.push(`/login?redirect=/membership`);
      return;
    }

    setSubscribingTier(tierId);

    try {
      const token = Cookies.get('user_token');
      const response = await fetch('/api/create-membership-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tierId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.details || data.error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setSubscribingTier(null);
    }
  };

  const userHasMembership = user?.membership?.status === 'active';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load membership content</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-50 opacity-50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6">
            {content.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {content.subtitle}
          </p>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-12">
            Member Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.benefits.map((benefit, index) => {
              const IconComponent = benefitIcons[index % benefitIcons.length];
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-pink-50 hover:bg-pink-100 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-500 text-white mb-4">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-4">
            Choose Your Membership
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Select the perfect membership tier that matches your lash goals. 
            All memberships include 2 refills per month or 1 full-set.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${
                  tier.popular ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                {/* Header */}
                <div className={`bg-gradient-to-r ${tierColors[index % tierColors.length]} p-6 text-white`}>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-white/80 ml-2">/month</span>
                  </div>
                </div>
                
                {/* Features */}
                <div className="bg-white p-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <FiCheck className="w-5 h-5 text-pink-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {userHasMembership && user?.membership?.tierId === tier.id ? (
                    <div className="mt-6 block w-full text-center py-3 px-4 rounded-full font-semibold bg-green-500 text-white">
                      Current Plan
                    </div>
                  ) : userHasMembership ? (
                    <div className="mt-6 block w-full text-center py-3 px-4 rounded-full font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">
                      Already Subscribed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={subscribingTier !== null}
                      className={`mt-6 block w-full text-center py-3 px-4 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        tier.popular
                          ? 'bg-pink-500 text-white hover:bg-pink-600'
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      }`}
                    >
                      {subscribingTier === tier.id ? (
                        <span className="flex items-center justify-center">
                          <FiLoader className="animate-spin mr-2" />
                          Processing...
                        </span>
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            {content.cta.title}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {content.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={content.cta.primaryButtonLink}
              className="bg-white text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-pink-50 transition-colors"
            >
              {content.cta.primaryButtonText}
            </Link>
            <Link
              href={content.cta.secondaryButtonLink}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              {content.cta.secondaryButtonText}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
