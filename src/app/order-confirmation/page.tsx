'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiPackage, FiMail, FiPhone, FiMapPin, FiHome } from 'react-icons/fi';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/orders');
      if (response.ok) {
        const orders = await response.json();
        const foundOrder = orders.find((o: any) => o.id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
          // Verify payment was successful
          if (foundOrder.paymentStatus === 'paid' || sessionId) {
            setPaymentVerified(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your order information.</p>
          <Link
            href="/"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-green-50 px-6 py-8 text-center border-b">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {paymentVerified ? 'Payment Successful!' : 'Order Received!'}
            </h1>
            <p className="text-lg text-gray-600">
              {paymentVerified 
                ? 'Your payment has been processed and your order is confirmed.'
                : 'Thank you for your order. We\'ll send you a confirmation email shortly.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Order ID: <span className="font-mono font-semibold">{order.id}</span>
            </p>
            {paymentVerified && (
              <div className="mt-3 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Payment Verified
              </div>
            )}
          </div>

          <div className="px-6 py-8 space-y-6">
            {/* Order Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-pink-600">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                {order.shippingCost && order.shippingCost > 0 && (
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      ${order.shippingCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.taxAmount && order.taxAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Tax {order.taxRate && `(${order.taxRate}%)`}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${order.taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <FiMail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{order.customerEmail}</span>
                </div>
                <div className="flex items-center">
                  <FiPhone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{order.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiMapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{order.shippingAddress.address}</p>
                      <p className="text-gray-900">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Important Information */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex">
                <FiPackage className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">What's Next?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• You'll receive an email confirmation shortly</li>
                    <li>• We'll notify you when your order ships</li>
                    <li>• Track your order status in your email</li>
                    <li>• Contact us if you have any questions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/"
                className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors text-center font-medium flex items-center justify-center"
              >
                <FiHome className="mr-2" />
                Return Home
              </Link>
              <Link
                href="/shop"
                className="flex-1 border-2 border-pink-600 text-pink-600 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors text-center font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-2">Questions about your order?</p>
          <Link href="/contact" className="text-pink-600 hover:text-pink-700 font-medium">
            Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
