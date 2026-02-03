'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { contentManager } from '@/lib/content-manager';
import { getMembershipBenefits, calculateProductDiscount } from '@/lib/membership-utils';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  benefits?: {
    productDiscount?: number;
    serviceDiscount?: number;
    pointsRate?: number;
    freeRefillsPerMonth?: number;
    freeFullSetsPerMonth?: number;
  };
}

export default function CartSidebar() {
  const router = useRouter();
  const { state, removeItem, updateQuantity, isOpen, toggleCart } = useCart();
  const { user, isAuthenticated } = useUser();
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);

  const lockScroll = () => {
    const body = document.body;
    const html = document.documentElement;
    const count = Number(body.dataset.scrollLockCount || '0');
    body.dataset.scrollLockCount = String(count + 1);
    if (count === 0) {
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    }
  };

  const unlockScroll = () => {
    const body = document.body;
    const html = document.documentElement;
    const count = Number(body.dataset.scrollLockCount || '0');
    const nextCount = Math.max(0, count - 1);
    if (nextCount === 0) {
      delete body.dataset.scrollLockCount;
      body.style.overflow = '';
      html.style.overflow = '';
    } else {
      body.dataset.scrollLockCount = String(nextCount);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchTiers = async () => {
      const siteContent = await contentManager.getSiteContent();
      setMembershipTiers(siteContent.membership?.tiers || []);
    };
    fetchTiers();
  }, []);

  const benefits = isAuthenticated && user?.membership?.status === 'active'
    ? getMembershipBenefits(user.membership.tierId, membershipTiers)
    : null;

  const getDiscountedPrice = (price: number) => {
    return benefits ? calculateProductDiscount(price, benefits) : price;
  };

  const discountedTotal = state.items.reduce((sum, item) => {
    return sum + getDiscountedPrice(item.price) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    toggleCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Shopping Cart ({state.itemCount})</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={toggleCart}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {benefits ? (
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-pink-600">${getDiscountedPrice(item.price).toFixed(2)}</p>
                            <p className="text-xs text-gray-400 line-through">${item.price.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-primary-600">${item.price.toFixed(2)}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {benefits && (
                  <div className="bg-pink-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-pink-600 font-medium">
                      🎉 Member Discount Applied ({benefits.productDiscount}% off)
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  {benefits ? (
                    <div className="text-right">
                      <span className="text-pink-600">${discountedTotal.toFixed(2)}</span>
                      <span className="text-sm text-gray-400 line-through ml-2">${state.total.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span>${state.total.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-full font-medium transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={toggleCart}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-full font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
