'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiCalendar, FiDollarSign, FiAlertCircle, FiLock, FiArrowLeft, FiCheckCircle, FiStar, FiEdit2, FiPlus, FiMinus } from 'react-icons/fi';
import Cookies from 'js-cookie';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { contentManager, SiteContent } from '@/lib/content-manager';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  suspended?: boolean;
  suspendedReason?: string;
  membership?: {
    tierId: string;
    tierName: string;
    status: 'active' | 'cancelled' | 'past_due';
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    usage?: {
      currentPeriodStart: string;
      refillsUsed: number;
      fullSetsUsed: number;
    };
  };
  points?: {
    balance: number;
    lifetimeEarned: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  price: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, totalAppointments: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [membershipTiers, setMembershipTiers] = useState<SiteContent['membership']['tiers']>([]);
  
  // Action modals
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedTierId, setSelectedTierId] = useState('');
  const [membershipAction, setMembershipAction] = useState<'assign' | 'cancel' | 'change'>('assign');
  const [pointsAdjustment, setPointsAdjustment] = useState(0);
  const [pointsReason, setPointsReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, adminLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUserData();
    }
  }, [isAdmin, userId]);

  const fetchUserData = async () => {
    try {
      const token = Cookies.get('admin_token');
      const [userRes, siteContent] = await Promise.all([
        fetch(`/api/admin/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        contentManager.getSiteContent()
      ]);

      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
        setOrders(data.orders);
        setAppointments(data.appointments);
        setStats(data.stats);
      }
      setMembershipTiers(siteContent.membership?.tiers || []);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    setIsProcessing(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'suspend',
          reason: suspendReason
        })
      });

      if (res.ok) {
        toast.success('User suspended successfully');
        setShowSuspendModal(false);
        setSuspendReason('');
        fetchUserData();
      } else {
        toast.error('Failed to suspend user');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsuspendUser = async () => {
    setIsProcessing(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'unsuspend'
        })
      });

      if (res.ok) {
        toast.success('User unsuspended successfully');
        fetchUserData();
      } else {
        toast.error('Failed to unsuspend user');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsProcessing(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'reset-password',
          newPassword
        })
      });

      if (res.ok) {
        toast.success('Password reset successfully');
        setShowResetPasswordModal(false);
        setNewPassword('');
      } else {
        toast.error('Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMembershipAction = async () => {
    setIsProcessing(true);
    try {
      const token = Cookies.get('admin_token');
      const body: Record<string, unknown> = { action: 'update-membership', membershipAction };
      
      if (membershipAction === 'assign' || membershipAction === 'change') {
        if (!selectedTierId) {
          toast.error('Please select a membership tier');
          setIsProcessing(false);
          return;
        }
        const tier = membershipTiers.find(t => t.id === selectedTierId);
        body.tierId = selectedTierId;
        body.tierName = tier?.name;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(
          membershipAction === 'cancel' 
            ? 'Membership cancelled' 
            : membershipAction === 'assign' 
              ? 'Membership assigned' 
              : 'Membership updated'
        );
        setShowMembershipModal(false);
        setSelectedTierId('');
        fetchUserData();
      } else {
        toast.error('Failed to update membership');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePointsAdjustment = async () => {
    if (pointsAdjustment === 0) {
      toast.error('Please enter a points amount');
      return;
    }
    if (!pointsReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setIsProcessing(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'adjust-points',
          pointsAmount: pointsAdjustment,
          reason: pointsReason
        })
      });

      if (res.ok) {
        toast.success(`Points ${pointsAdjustment > 0 ? 'added' : 'deducted'} successfully`);
        setShowPointsModal(false);
        setPointsAdjustment(0);
        setPointsReason('');
        fetchUserData();
      } else {
        toast.error('Failed to adjust points');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetUsage = async () => {
    setIsProcessing(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'reset-usage' })
      });

      if (res.ok) {
        toast.success('Usage reset successfully');
        fetchUserData();
      } else {
        toast.error('Failed to reset usage');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (adminLoading || !isAdmin || isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin/users" className="text-pink-600 hover:text-pink-700 flex items-center mb-2">
              <FiArrowLeft className="mr-2" />
              Back to Users
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="flex space-x-3">
            {user.suspended ? (
              <button
                onClick={handleUnsuspendUser}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <FiCheckCircle className="mr-2" />
                Unsuspend User
              </button>
            ) : (
              <button
                onClick={() => setShowSuspendModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <FiAlertCircle className="mr-2" />
                Suspend User
              </button>
            )}
            <button
              onClick={() => setShowResetPasswordModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FiLock className="mr-2" />
              Reset Password
            </button>
          </div>
        </div>

        {/* Status Alert */}
        {user.suspended && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-600 mr-3" />
              <div>
                <p className="font-semibold text-red-800">Account Suspended</p>
                <p className="text-red-600 text-sm">Reason: {user.suspendedReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiShoppingBag className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiCalendar className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FiUser className="mr-2" />
                    Name
                  </p>
                  <p className="text-gray-900 font-medium">{user.firstName} {user.lastName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FiMail className="mr-2" />
                    Email
                  </p>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FiPhone className="mr-2" />
                    Phone
                  </p>
                  <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                </div>

                {user.address && (
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FiMapPin className="mr-2" />
                      Address
                    </p>
                    <p className="text-gray-900 text-sm">
                      {user.address.street}<br />
                      {user.address.city}, {user.address.state} {user.address.zipCode}<br />
                      {user.address.country}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Membership Management */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiStar className="mr-2 text-pink-500" />
                  Membership
                </h2>
                <button
                  onClick={() => {
                    setMembershipAction(user.membership?.status === 'active' ? 'change' : 'assign');
                    setSelectedTierId(user.membership?.tierId || '');
                    setShowMembershipModal(true);
                  }}
                  className="text-pink-600 hover:text-pink-700 text-sm flex items-center"
                >
                  <FiEdit2 className="mr-1" />
                  {user.membership?.status === 'active' ? 'Manage' : 'Assign'}
                </button>
              </div>

              {user.membership?.status === 'active' ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 text-white">
                    <p className="text-pink-100 text-xs">Current Plan</p>
                    <p className="text-xl font-bold">{user.membership.tierName}</p>
                    <p className="text-pink-100 text-sm mt-1">
                      {user.membership.cancelAtPeriodEnd 
                        ? `Cancels: ${new Date(user.membership.currentPeriodEnd || '').toLocaleDateString()}`
                        : `Renews: ${new Date(user.membership.currentPeriodEnd || '').toLocaleDateString()}`
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-pink-600">{user.points?.balance || 0}</p>
                      <p className="text-xs text-gray-500">Points</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-pink-600">{user.membership.usage?.refillsUsed || 0}</p>
                      <p className="text-xs text-gray-500">Refills Used</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPointsModal(true)}
                      className="flex-1 text-xs px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200"
                    >
                      Adjust Points
                    </button>
                    <button
                      onClick={handleResetUsage}
                      disabled={isProcessing}
                      className="flex-1 text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Reset Usage
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiStar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No active membership</p>
                  <button
                    onClick={() => {
                      setMembershipAction('assign');
                      setShowMembershipModal(true);
                    }}
                    className="mt-3 text-sm text-pink-600 hover:text-pink-700"
                  >
                    + Assign Membership
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Orders & Appointments */}
          <div className="lg:col-span-2">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No appointments yet</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{apt.serviceName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${apt.price.toFixed(2)}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspend User</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for suspending this user's account:
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-pink-500"
              rows={4}
              placeholder="Enter suspension reason..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Suspending...' : 'Suspend User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset User Password</h3>
            <p className="text-gray-600 mb-4">
              Enter a new password for {user.firstName} {user.lastName}:
            </p>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:ring-2 focus:ring-pink-500"
              placeholder="New password (min 6 characters)"
            />
            <p className="text-xs text-gray-500 mb-4">
              The user will need to use this password to log in.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {membershipAction === 'assign' ? 'Assign Membership' : 
               membershipAction === 'change' ? 'Change Membership' : 'Cancel Membership'}
            </h3>
            
            {user.membership?.status === 'active' && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setMembershipAction('change')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                    membershipAction === 'change' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Change Tier
                </button>
                <button
                  onClick={() => setMembershipAction('cancel')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                    membershipAction === 'cancel' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            )}

            {membershipAction !== 'cancel' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Membership Tier
                </label>
                <select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">-- Select a tier --</option>
                  {membershipTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} - ${tier.price}/mo
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this user&apos;s membership? They will lose access to all membership benefits.
              </p>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowMembershipModal(false);
                  setSelectedTierId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleMembershipAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  membershipAction === 'cancel' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 
                 membershipAction === 'cancel' ? 'Cancel Membership' : 
                 membershipAction === 'assign' ? 'Assign' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Adjustment Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust Points</h3>
            <p className="text-gray-600 mb-4">
              Current balance: <span className="font-bold text-pink-600">{user.points?.balance || 0} points</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points Amount
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPointsAdjustment(prev => prev - 10)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FiMinus />
                </button>
                <input
                  type="number"
                  value={pointsAdjustment}
                  onChange={(e) => setPointsAdjustment(Number(e.target.value))}
                  className="flex-1 border border-gray-300 rounded-lg p-3 text-center focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={() => setPointsAdjustment(prev => prev + 10)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FiPlus />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use negative numbers to deduct points
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <input
                type="text"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., Loyalty bonus, Correction, etc."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPointsModal(false);
                  setPointsAdjustment(0);
                  setPointsReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handlePointsAdjustment}
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Adjust Points'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
