'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

function MembershipSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [membershipName, setMembershipName] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      router.push('/membership');
      return;
    }

    // Verify the session and activate membership
    const verifySession = async () => {
      try {
        const response = await fetch('/api/verify-membership-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          setMembershipName(data.tierName || 'Membership');
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    verifySession();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Activating your membership...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t verify your membership. Please contact support if you were charged.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Family!</h1>
        <p className="text-xl text-pink-600 font-semibold mb-2">{membershipName}</p>
        <p className="text-gray-600 mb-8">
          Your membership is now active. Enjoy all the exclusive benefits and discounts!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account"
            className="bg-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
          >
            View My Account
          </Link>
          <Link
            href="/services"
            className="border-2 border-pink-500 text-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition-colors"
          >
            Book a Service
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MembershipSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <MembershipSuccessContent />
    </Suspense>
  );
}
