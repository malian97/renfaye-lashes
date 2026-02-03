'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiCalendar, FiClock, FiMail, FiPhone, FiHome } from 'react-icons/fi';

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  const sessionId = searchParams.get('session_id');
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      // Verify the session with Stripe and update appointment status
      if (sessionId && appointmentId) {
        const verifyResponse = await fetch('/api/verify-booking-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, appointmentId }),
        });

        if (verifyResponse.ok) {
          const data = await verifyResponse.json();
          setAppointment(data.appointment);
          setLoading(false);
          return;
        }
      }

      // Fallback: load appointment directly if verification fails
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const appointments = await response.json();
        const apt = appointments.find((a: any) => a.id === appointmentId);
        if (apt) {
          setAppointment(apt);
        }
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
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

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your booking information.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">
              Your appointment has been successfully booked and paid.
            </p>
          </div>

          <div className="px-6 py-8 space-y-6">
            {/* Appointment Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">{appointment.serviceName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <div className="flex items-center text-gray-900 font-medium">
                    <FiCalendar className="mr-2 text-pink-600" />
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <div className="flex items-center text-gray-900 font-medium">
                    <FiClock className="mr-2 text-pink-600" />
                    {appointment.time}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="text-2xl font-bold text-pink-600">
                    ${appointment.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <FiMail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{appointment.customerEmail}</span>
                </div>
                <div className="flex items-center">
                  <FiPhone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{appointment.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Confirmation Email Notice */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex">
                <FiMail className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Confirmation Email Sent</h3>
                  <p className="text-sm text-blue-700">
                    We've sent a confirmation email to <strong>{appointment.customerEmail}</strong> with all the details of your appointment.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-medium text-yellow-900 mb-2">Important Information</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Please arrive 5-10 minutes early for your appointment</li>
                <li>• Come with clean, makeup-free lashes</li>
                <li>• Avoid caffeine before your appointment for better results</li>
                <li>• Contact us if you need to reschedule</li>
              </ul>
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
                href="/services"
                className="flex-1 border-2 border-pink-600 text-pink-600 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors text-center font-medium"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-2">Questions about your appointment?</p>
          <Link href="/contact" className="text-pink-600 hover:text-pink-700 font-medium">
            Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
