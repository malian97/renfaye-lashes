'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiCheck, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok) {
        setAdminEmail(data.email);
        setEmailSent(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <FiShield className="text-pink-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Password Reset</h1>
            </div>
            
            <p className="text-gray-600 mb-6">
              Password reset instructions sent to <strong>{adminEmail}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">📬 Next Steps:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Check your email inbox</li>
                <li>• Click the reset link (valid for 1 hour)</li>
                <li>• Set your new admin password</li>
                <li>• Check spam folder if you don't see it</li>
              </ul>
            </div>

            <Link
              href="/admin/login"
              className="block w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all"
            >
              Back to Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FiShield className="text-pink-500 text-3xl mr-3" />
            <h1 className="text-4xl font-bold text-white">Admin Account</h1>
          </div>
          <p className="text-gray-300">
            Reset your administrator password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>🔐 Security Notice:</strong> A password reset link will be sent to the registered admin email address.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FiMail className="mr-2" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <Link
              href="/admin/login"
              className="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Admin Login
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 shadow-md">
          <p className="text-sm text-gray-300 text-center">
            🔒 Reset links expire after 1 hour and can only be used once for security.
          </p>
        </div>
      </div>
    </div>
  );
}
