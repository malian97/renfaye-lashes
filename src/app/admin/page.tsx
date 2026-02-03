'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiPackage, FiShoppingCart, FiUsers, FiTrendingUp, FiEdit, FiImage, FiFileText, FiSettings, FiClock, FiMail, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    bookings: 0,
    totalRevenue: 0,
    productRevenue: 0,
    serviceRevenue: 0,
    membershipRevenue: 0,
    customers: 0,
    activeMembers: 0
  });
  const [timePeriod, setTimePeriod] = useState<string>('all');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    // Load stats from server-side API
    const loadStats = async () => {
      try {
        const res = await fetch(`/api/admin/stats?period=${timePeriod}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          console.error('Failed to fetch stats:', res.status);
        }
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    };
    
    loadStats();
  }, [timePeriod]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const quickActions = [
    { icon: FiPackage, label: 'Manage Products', href: '/admin/products', color: 'bg-blue-500' },
    { icon: FiClock, label: 'Manage Services', href: '/admin/services', color: 'bg-teal-500' },
    { icon: FiCalendar, label: 'View Bookings', href: '/admin/bookings', color: 'bg-purple-500' },
    { icon: FiCalendar, label: 'Schedule Settings', href: '/admin/schedule', color: 'bg-orange-500' },
    { icon: FiShoppingCart, label: 'View Orders', href: '/admin/orders', color: 'bg-green-500' },
    { icon: FiMail, label: 'Contact Submissions', href: '/admin/contact-submissions', color: 'bg-pink-500' },
    { icon: FiEdit, label: 'Edit Content', href: '/admin/content', color: 'bg-cyan-500' },
    { icon: FiImage, label: 'Media Library', href: '/admin/media', color: 'bg-yellow-500' },
    { icon: FiFileText, label: 'Edit Pages', href: '/admin/pages', color: 'bg-indigo-500' },
    { icon: FiSettings, label: 'Settings', href: '/admin/settings', color: 'bg-gray-500' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s an overview of your website.</p>
        </div>

        {/* Stats Grid - Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.bookings}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiCalendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.customers}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <FiUsers className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Revenue Breakdown</h2>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Product Sales</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">${stats.productRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Service Bookings</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">${stats.serviceRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FiClock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Memberships (Monthly)</p>
                  <p className="text-2xl font-bold text-pink-600 mt-1">${stats.membershipRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.activeMembers} active member{stats.activeMembers !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-pink-100 p-3 rounded-lg">
                  <FiUsers className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
