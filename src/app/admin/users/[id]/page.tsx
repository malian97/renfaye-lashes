'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiCalendar, FiDollarSign, FiAlertCircle, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Cookies from 'js-cookie';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  
  // Action modals
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setOrders(data.orders);
        setAppointments(data.appointments);
        setStats(data.stats);
      }
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
    </AdminLayout>
  );
}
