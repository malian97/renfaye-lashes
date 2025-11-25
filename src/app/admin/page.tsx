'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiPackage, FiShoppingCart, FiUsers, FiTrendingUp, FiEdit, FiImage, FiFileText, FiSettings, FiClock, FiMail, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { contentManager } from '@/lib/content-manager';

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    // Load stats
    const loadStats = async () => {
      const products = await contentManager.getProducts();
      const orders = await contentManager.getOrders();
      const revenue = orders.reduce((sum, order) => sum + order.total, 0);
      
      setStats({
        products: products.length,
        orders: orders.length,
        revenue,
        customers: new Set(orders.map(o => o.customerEmail)).size
      });
    };
    
    loadStats();
  }, []);

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.products}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${stats.revenue.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
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
