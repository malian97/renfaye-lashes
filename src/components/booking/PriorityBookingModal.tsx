'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { contentManager } from '@/lib/content-manager';
import { getMembershipBenefits, MembershipBenefits } from '@/lib/membership-utils';
import { FiX, FiCalendar, FiClock, FiGift, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string | number;
  duration: string;
  serviceType?: 'full_set' | 'refill' | 'other';
}

interface MembershipTier {
  id: string;
  name: string;
  benefits?: Partial<MembershipBenefits>;
}

interface PriorityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PriorityBookingModal({ isOpen, onClose, onSuccess }: PriorityBookingModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState<'select' | 'service' | 'datetime' | 'confirm'>('select');
  const [benefitType, setBenefitType] = useState<'refill' | 'full_set' | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const benefits = user?.membership?.tierId 
    ? getMembershipBenefits(user.membership.tierId, membershipTiers)
    : null;

  const refillsRemaining = benefits 
    ? (benefits.freeRefillsPerMonth || 0) - (user?.membership?.usage?.refillsUsed || 0)
    : 0;
  
  const fullSetsRemaining = benefits
    ? (benefits.freeFullSetsPerMonth || 0) - (user?.membership?.usage?.fullSetsUsed || 0)
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      const siteContent = await contentManager.getSiteContent();
      setMembershipTiers(siteContent.membership?.tiers || []);
      
      const allServices = await contentManager.getServices();
      setServices(allServices);
    };
    if (isOpen) {
      fetchData();
      setStep('select');
      setBenefitType(null);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return;
    
    setLoadingSlots(true);
    try {
      const slots = await contentManager.getAvailableSlots(selectedDate, selectedService.id);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available times');
    } finally {
      setLoadingSlots(false);
    }
  };

  const getFilteredServices = () => {
    if (!benefitType) return [];
    return services.filter(s => s.serviceType === benefitType);
  };

  const handleSelectBenefit = (type: 'refill' | 'full_set') => {
    setBenefitType(type);
    setStep('service');
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !user) {
      toast.error('Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/appointments/priority-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          customerName: `${user.firstName} ${user.lastName}`,
          customerEmail: user.email,
          customerPhone: user.phone || '',
          date: selectedDate,
          time: selectedTime,
          benefitType: benefitType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      toast.success('Appointment booked successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Priority Booking</h2>
            <p className="text-pink-100 text-sm">Redeem your membership benefit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Select Benefit Type */}
          {step === 'select' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What would you like to redeem?
              </h3>

              {refillsRemaining > 0 && (
                <button
                  onClick={() => handleSelectBenefit('refill')}
                  className="w-full p-4 border-2 border-pink-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Free Refill</p>
                      <p className="text-sm text-gray-600">
                        {refillsRemaining} remaining this month
                      </p>
                    </div>
                    <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
                      <FiGift className="inline mr-1" />
                      FREE
                    </div>
                  </div>
                </button>
              )}

              {fullSetsRemaining > 0 && (
                <button
                  onClick={() => handleSelectBenefit('full_set')}
                  className="w-full p-4 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Free Full Set</p>
                      <p className="text-sm text-gray-600">
                        {fullSetsRemaining} remaining this month
                      </p>
                    </div>
                    <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      <FiGift className="inline mr-1" />
                      FREE
                    </div>
                  </div>
                </button>
              )}

              {refillsRemaining <= 0 && fullSetsRemaining <= 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FiGift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>You've used all your free benefits this month.</p>
                  <p className="text-sm mt-2">Benefits reset at the start of your next billing period.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Service */}
          {step === 'service' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('select')}
                className="text-pink-600 text-sm hover:underline mb-2"
              >
                ← Back
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select a {benefitType === 'refill' ? 'Refill' : 'Full Set'} Service
              </h3>

              {getFilteredServices().length > 0 ? (
                <div className="space-y-3">
                  {getFilteredServices().map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className="w-full p-4 border border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all text-left"
                    >
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                      <p className="text-sm text-gray-400 line-through">{service.price}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No {benefitType === 'refill' ? 'refill' : 'full set'} services available.</p>
                  <p className="text-sm mt-2">Please contact us to book your free service.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 'datetime' && selectedService && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('service')}
                className="text-pink-600 text-sm hover:underline mb-2"
              >
                ← Back
              </button>

              <div className="bg-pink-50 rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900">{selectedService.name}</p>
                <p className="text-sm text-gray-600">{selectedService.duration}</p>
                <p className="text-sm text-green-600 font-medium">FREE with your membership</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline mr-2" />
                    Select Time
                  </label>
                  {loadingSlots ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedTime === slot
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-pink-100'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No available slots for this date
                    </p>
                  )}
                </div>
              )}

              {selectedDate && selectedTime && (
                <button
                  onClick={() => setStep('confirm')}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  Continue to Confirm
                </button>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && selectedService && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('datetime')}
                className="text-pink-600 text-sm hover:underline mb-2"
              >
                ← Back
              </button>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Your Booking
              </h3>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-pink-200">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-green-600">
                    FREE <span className="text-gray-400 line-through text-sm ml-1">{selectedService.price}</span>
                  </span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center text-green-700">
                  <FiCheck className="w-5 h-5 mr-2" />
                  <span className="font-medium">No payment required</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  This service is covered by your {user?.membership?.tierName} membership.
                </p>
              </div>

              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
