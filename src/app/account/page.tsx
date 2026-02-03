'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiLogOut, FiSave, FiEye, FiEyeOff, FiPackage, FiCalendar, FiDollarSign, FiStar, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import OrderHistory from '@/components/account/OrderHistory';
import Appointments from '@/components/account/Appointments';
import TransactionHistory from '@/components/account/TransactionHistory';

export default function AccountPage() {
  const { user, isLoading: userLoading, isAuthenticated, logout, updateProfile } = useUser();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'membership' | 'orders' | 'appointments' | 'transactions' | 'password'>('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, userLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const success = await updateProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      address: profileData.address
    });

    setIsUpdating(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpdating(true);

    const success = await updateProfile({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    } as any);

    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }

    setIsUpdating(false);
  };

  const handleCancelMembership = async () => {
    setIsCancelling(true);
    try {
      const Cookies = (await import('js-cookie')).default;
      const token = Cookies.get('user_token');
      const response = await fetch('/api/cancel-membership', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Your membership will be cancelled at the end of your billing period');
        setShowCancelModal(false);
        // Refresh user data
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to cancel membership');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsCancelling(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUser className="inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('membership')}
                className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'membership'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiStar className="inline mr-2" />
                Membership
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiPackage className="inline mr-2" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'appointments'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiCalendar className="inline mr-2" />
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'transactions'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiDollarSign className="inline mr-2" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'password'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiLock className="inline mr-2" />
                Password
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'orders' ? (
              <OrderHistory />
            ) : activeTab === 'appointments' ? (
              <Appointments />
            ) : activeTab === 'transactions' ? (
              <TransactionHistory />
            ) : activeTab === 'membership' ? (
              <div className="space-y-6">
                {user?.membership?.status === 'active' ? (
                  <>
                    {/* Current Plan Card */}
                    <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pink-100 text-sm mb-1">Current Plan</p>
                          <h3 className="text-2xl font-bold">{user.membership.tierName}</h3>
                          <p className="text-pink-100 mt-2">
                            {user.membership.cancelAtPeriodEnd 
                              ? `Cancels on ${new Date(user.membership.currentPeriodEnd || '').toLocaleDateString()}`
                              : `Renews on ${new Date(user.membership.currentPeriodEnd || '').toLocaleDateString()}`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <FiStar className="w-12 h-12 text-white/50" />
                        </div>
                      </div>
                    </div>

                    {/* Points & Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-sm">Points Balance</p>
                        <p className="text-3xl font-bold text-pink-600">{user.points?.balance || 0}</p>
                        <p className="text-xs text-gray-400">Lifetime: {user.points?.lifetimeEarned || 0} pts</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-sm">Refills Used</p>
                        <p className="text-3xl font-bold text-pink-600">
                          {user.membership.usage?.refillsUsed || 0}
                        </p>
                        <p className="text-xs text-gray-400">This billing period</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-sm">Full Sets Used</p>
                        <p className="text-3xl font-bold text-pink-600">
                          {user.membership.usage?.fullSetsUsed || 0}
                        </p>
                        <p className="text-xs text-gray-400">This billing period</p>
                      </div>
                    </div>

                    {/* Benefits Summary */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Your Benefits</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <p className="text-2xl font-bold text-pink-600">10%</p>
                          <p className="text-xs text-gray-600">Product Discount</p>
                        </div>
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <p className="text-2xl font-bold text-pink-600">5%</p>
                          <p className="text-xs text-gray-600">Points Rate</p>
                        </div>
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <p className="text-2xl font-bold text-pink-600">2</p>
                          <p className="text-xs text-gray-600">Free Refills/Mo</p>
                        </div>
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <p className="text-2xl font-bold text-pink-600">∞</p>
                          <p className="text-xs text-gray-600">Priority Booking</p>
                        </div>
                      </div>
                    </div>

                    {/* Cancel Membership */}
                    {!user.membership.cancelAtPeriodEnd && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Manage Subscription</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Your membership renews automatically each month. You can cancel anytime.
                        </p>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          <FiXCircle className="mr-2" />
                          Cancel Membership
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Membership</h3>
                    <p className="text-gray-600 mb-4">
                      Join our membership program to enjoy exclusive benefits and discounts.
                    </p>
                    <a
                      href="/membership"
                      className="inline-block bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
                    >
                      View Memberships
                    </a>
                  </div>
                )}
              </div>
            ) : activeTab === 'profile' ? (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="mr-2" />
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={profileData.address.street}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={profileData.address.zipCode}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      disabled={isUpdating}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      disabled={isUpdating}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      disabled={isUpdating}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiLock className="mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Membership Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancel Membership?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your <strong>{user?.membership?.tierName}</strong> membership?
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• You&apos;ll keep your benefits until {user?.membership?.currentPeriodEnd ? new Date(user.membership.currentPeriodEnd).toLocaleDateString() : 'the end of your billing period'}</li>
              <li>• You won&apos;t be charged again after cancellation</li>
              <li>• You can resubscribe anytime</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                disabled={isCancelling}
              >
                Keep Membership
              </button>
              <button
                onClick={handleCancelMembership}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
