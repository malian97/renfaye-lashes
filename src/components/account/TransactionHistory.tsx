'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiPackage, FiCalendar } from 'react-icons/fi';
import Cookies from 'js-cookie';

interface Transaction {
  id: string;
  type: 'order' | 'appointment';
  description: string;
  amount: number;
  status: string;
  date: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = Cookies.get('user_token');
      
      // Fetch both orders and appointments
      const [ordersRes, appointmentsRes] = await Promise.all([
        fetch('/api/user/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/user/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : { appointments: [] };

      // Combine and format transactions
      const orderTransactions: Transaction[] = (ordersData.orders || []).map((order: any) => ({
        id: order.id,
        type: 'order' as const,
        description: `Order: ${order.items.map((item: any) => item.productName).join(', ')}`,
        amount: order.total,
        status: order.status,
        date: order.createdAt
      }));

      const appointmentTransactions: Transaction[] = (appointmentsData.appointments || []).map((apt: any) => ({
        id: apt.id,
        type: 'appointment' as const,
        description: `Appointment: ${apt.serviceName}`,
        amount: apt.price,
        status: apt.status,
        date: apt.createdAt || apt.date
      }));

      // Combine and sort by date (newest first)
      const allTransactions = [...orderTransactions, ...appointmentTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTotalSpent = () => {
    return transactions
      .filter(t => t.status.toLowerCase() !== 'cancelled')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
        <p className="text-gray-500">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-medium mb-2">Total Spent</h3>
        <p className="text-4xl font-bold">${getTotalSpent().toFixed(2)}</p>
        <p className="text-pink-100 mt-2">{transactions.length} total transactions</p>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${transaction.type === 'order' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                  {transaction.type === 'order' ? (
                    <FiPackage className="text-blue-600" />
                  ) : (
                    <FiCalendar className="text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <span className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${transaction.amount.toFixed(2)}</p>
                <span className="text-xs text-gray-500 uppercase">{transaction.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
