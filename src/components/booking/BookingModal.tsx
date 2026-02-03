'use client';

import { useState, useEffect } from 'react';
import { Service, contentManager } from '@/lib/content-manager';
import { useUser } from '@/contexts/UserContext';
import { FiX, FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiDollarSign, FiStar, FiGift } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { 
  POINTS_CONFIG, 
  calculatePointsEarned, 
  canRedeemPoints, 
  calculateMaxRedeemablePoints,
  calculatePointsDiscount,
  getMembershipBenefits
} from '@/lib/membership-utils';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function BookingModal({ service, isOpen, onClose }: BookingModalProps) {
  const { user, isAuthenticated } = useUser();
  const [step, setStep] = useState(1); // 1: Info, 2: Date/Time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Get membership benefits and points
  const userPoints = user?.points?.balance || 0;
  const canRedeem = canRedeemPoints(userPoints);
  const benefits = isAuthenticated && user?.membership?.status === 'active'
    ? getMembershipBenefits(user.membership.tierId, membershipTiers)
    : null;
  const pointsRate = benefits?.pointsRate || 0;
  const maxRedeemable = calculateMaxRedeemablePoints(userPoints, service.price);
  const pointsDiscount = usePoints ? calculatePointsDiscount(pointsToRedeem) : 0;
  const finalPrice = Math.max(0, service.price - pointsDiscount);
  const pointsToEarn = pointsRate > 0 ? calculatePointsEarned(finalPrice, pointsRate) : 0;

  // Fetch membership tiers
  useEffect(() => {
    const fetchTiers = async () => {
      const siteContent = await contentManager.getSiteContent();
      setMembershipTiers(siteContent.membership?.tiers || []);
    };
    fetchTiers();
  }, []);

  // Auto-populate form with user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}` || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user, isOpen]);

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await contentManager.getAvailableSlots(selectedDate, service.id);
      setAvailableSlots(slots);
      if (slots.length === 0) {
        toast.error('No available slots for this date');
      }
    } catch (error) {
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      // Create appointment with points data
      const appointment = await contentManager.createAppointment({
        serviceId: service.id,
        serviceName: service.name,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        date: selectedDate,
        time: selectedTime,
        price: finalPrice,
        originalPrice: service.price,
        pointsRedeemed: usePoints ? pointsToRedeem : 0,
        pointsDiscount: pointsDiscount,
        pointsToEarn: pointsToEarn,
        userId: user?.id,
        status: 'pending',
        paymentStatus: 'pending',
        notes: formData.notes
      });

      // Create Stripe checkout session
      const { url } = await contentManager.createCheckoutSession(appointment.id);
      
      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Complete your booking</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Service Info */}
          <div className="bg-pink-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">{service.duration}</span>
              <div className="text-right">
                {pointsDiscount > 0 ? (
                  <>
                    <span className="text-pink-600 font-bold text-xl">${finalPrice.toFixed(2)}</span>
                    <span className="text-gray-400 text-sm line-through ml-2">${service.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-pink-600 font-bold text-xl flex items-center">
                    <FiDollarSign className="w-5 h-5" />
                    {service.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">{service.description}</p>
            
            {/* Points Earning Preview */}
            {pointsToEarn > 0 && (
              <div className="mt-3 pt-3 border-t border-pink-200 flex items-center text-sm text-pink-600">
                <FiStar className="w-4 h-4 mr-1" />
                <span>Earn <strong>{pointsToEarn} points</strong> with this booking</span>
              </div>
            )}
          </div>

          {/* Points Redemption Section */}
          {isAuthenticated && canRedeem && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FiGift className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-medium text-gray-900">Redeem Points</span>
                </div>
                <span className="text-sm text-gray-600">
                  Balance: <strong>{userPoints} pts</strong>
                </span>
              </div>
              
              <label className="flex items-center cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => {
                    setUsePoints(e.target.checked);
                    if (e.target.checked) {
                      setPointsToRedeem(Math.min(maxRedeemable, userPoints));
                    } else {
                      setPointsToRedeem(0);
                    }
                  }}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Use points for this booking (1 point = $1)
                </span>
              </label>

              {usePoints && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={POINTS_CONFIG.MINIMUM_REDEMPTION}
                      max={maxRedeemable}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium text-purple-600 w-20 text-right">
                      {pointsToRedeem} pts
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {POINTS_CONFIG.MINIMUM_REDEMPTION}</span>
                    <span>Max: {maxRedeemable}</span>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <span className="text-sm text-gray-600">Discount: </span>
                    <span className="font-bold text-purple-600">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {!canRedeem && userPoints > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  You need at least {POINTS_CONFIG.MINIMUM_REDEMPTION} points to redeem. 
                  You have {userPoints} points.
                </p>
              )}
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Your Info</span>
            </div>
            <div className={`w-16 h-0.5 mx-2 ${step >= 2 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Date & Time</span>
            </div>
          </div>

          {/* Step 1: Customer Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  rows={3}
                  placeholder="Any special requests or information..."
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
              >
                Continue to Date & Time
              </button>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FiCalendar className="inline mr-2" />
                  Select Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Choose a date...</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FiClock className="inline mr-2" />
                    Select Time
                  </label>
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3 px-4 rounded-lg border-2 transition-all ${
                            selectedTime === slot
                              ? 'border-pink-600 bg-pink-50 text-pink-600 font-medium'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || loading}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
