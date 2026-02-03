'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentManager, Order } from '@/lib/content-manager';
import { FiPackage, FiClock, FiCheckCircle, FiSearch, FiEye, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const allOrders = await contentManager.getOrders();
    // Sort by date, newest first
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(allOrders);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await contentManager.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const openRefundModal = (order: Order) => {
    setRefundOrder(order);
    setRefundReason('');
    setShowRefundModal(true);
  };

  const handleRefund = async () => {
    if (!refundOrder) return;
    
    setIsRefunding(true);
    try {
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          id: refundOrder.id,
          reason: refundReason || 'Refund requested',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Order refunded successfully');
        setShowRefundModal(false);
        setRefundOrder(null);
        await loadOrders();
      } else {
        toast.error(data.error || 'Failed to process refund');
      }
    } catch (error) {
      toast.error('Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  const getDateRangeStart = (period: string): Date | null => {
    const now = new Date();
    switch (period) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'lastMonth':
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      case 'all':
      default:
        return null;
    }
  };

  const getDateRangeEnd = (period: string): Date | null => {
    const now = new Date();
    if (period === 'lastMonth') {
      return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }
    return null;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Time period filter
    const dateRangeStart = getDateRangeStart(timePeriod);
    const dateRangeEnd = getDateRangeEnd(timePeriod);
    const orderDate = new Date(order.createdAt);
    const matchesTime = (!dateRangeStart || orderDate >= dateRangeStart) && 
                        (!dateRangeEnd || orderDate <= dateRangeEnd);
    
    return matchesSearch && matchesStatus && matchesTime;
  });


  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and track fulfillment</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <FiClock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredOrders.filter(o => o.status === 'processing').length}
                </p>
              </div>
              <FiPackage className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredOrders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${filteredOrders.filter(o => o.paymentStatus !== 'refunded' && o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-pink-600 hover:text-pink-900"
                          title="View Details"
                        >
                          <FiEye className="inline w-4 h-4" />
                        </button>
                        {(order.paymentStatus === 'paid' || order.status === 'completed') && order.paymentStatus !== 'refunded' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => openRefundModal(order)}
                            className="text-red-600 hover:text-red-900 ml-2"
                            title="Refund Order"
                          >
                            <FiRefreshCw className="inline w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <p>{selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <div>
                            <p>{item.productName}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <p>Total</p>
                      <p>${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Confirmation Modal */}
        {showRefundModal && refundOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-red-600">Confirm Refund</h2>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-medium">
                      You are about to refund this order. This action cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p><strong>Order ID:</strong> #{refundOrder.id.slice(0, 8)}</p>
                    <p><strong>Customer:</strong> {refundOrder.customerName}</p>
                    <p><strong>Amount:</strong> <span className="text-red-600 font-bold">${refundOrder.total.toFixed(2)}</span></p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Reason (optional)
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Enter reason for refund..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isRefunding}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRefund}
                    disabled={isRefunding}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefunding ? 'Processing...' : 'Confirm Refund'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
