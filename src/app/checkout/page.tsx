'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { contentManager, SiteContent } from '@/lib/content-manager';
import { calculateMemberProductPrice, MembershipBenefits, calculatePointsEarned } from '@/lib/membership-utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { user, isAuthenticated } = useUser();
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(15); // Default $15
  const [taxRate, setTaxRate] = useState(0); // Default 0%
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [membershipTiers, setMembershipTiers] = useState<SiteContent['membership']['tiers']>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  // Auto-populate form with user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address?.street || prev.address,
        city: user.address?.city || prev.city,
        state: user.address?.state || prev.state,
        zipCode: user.address?.zipCode || prev.zipCode,
      }));
    }
  }, [isAuthenticated, user]);

  // Load shipping cost, tax rate, and membership tiers from settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const [settingsRes, siteContent] = await Promise.all([
          fetch('/api/settings'),
          contentManager.getSiteContent()
        ]);
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setShippingCost(settings.shippingCost || 15);
          setTaxRate(settings.taxRate || 0);
        }
        setMembershipTiers(siteContent.membership?.tiers || []);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Get user's membership benefits
  const getUserMembershipBenefits = (): MembershipBenefits | null => {
    if (!isAuthenticated || !user?.membership?.status || user.membership.status !== 'active') {
      return null;
    }
    const tier = membershipTiers.find(t => t.id === user.membership?.tierId);
    return tier?.benefits || null;
  };

  const memberBenefits = getUserMembershipBenefits();

  // Calculate subtotal with membership discount
  const calculateSubtotal = () => {
    if (!memberBenefits || memberBenefits.productDiscount <= 0) {
      return state.total;
    }
    return state.items.reduce((total, item) => {
      const { price } = calculateMemberProductPrice(item.price, memberBenefits);
      return total + (price * item.quantity);
    }, 0);
  };

  const originalSubtotal = state.total;
  const subtotal = calculateSubtotal();
  const memberDiscount = originalSubtotal - subtotal;
  // Points are only earned on services, not products - removed from product checkout
  const taxAmount = subtotal * (taxRate / 100);
  const totalWithShipping = subtotal + shippingCost + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: state.items.map(item => ({
          productId: item.id.toString(),
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalWithShipping,
        shippingCost: shippingCost,
        taxAmount: taxAmount,
        taxRate: taxRate,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        notes: formData.notes
      };

      // Create checkout session with order
      const response = await fetch('/api/create-order-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData,
          items: state.items,
          shippingCost: shippingCost,
          taxAmount: taxAmount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout using session URL
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="bg-white rounded-xl shadow-md p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or notes about your order..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-4 rounded-full font-medium text-lg hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">{item.category}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-pink-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${originalSubtotal.toFixed(2)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center">
                      <FiStar className="w-3 h-3 mr-1" />
                      Member Discount ({memberBenefits?.productDiscount}%)
                    </span>
                    <span className="font-medium">-${memberDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shippingCost.toFixed(2)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({taxRate}%)</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-pink-600">${totalWithShipping.toFixed(2)}</span>
                </div>
                {/* Points are only earned on services, not products */}
              </div>

              <button
                onClick={() => router.push('/shop')}
                className="w-full mt-6 bg-gray-100 text-gray-900 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
