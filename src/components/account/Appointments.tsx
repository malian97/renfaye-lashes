'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import Cookies from 'js-cookie';

interface Appointment {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  status: string;
  notes?: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = Cookies.get('user_token');
      const res = await fetch('/api/user/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <FiCheckCircle className="text-green-500" />;
      case 'completed':
        return <FiCheckCircle className="text-blue-500" />;
      case 'cancelled':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiAlertCircle className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.date) && apt.status !== 'cancelled');
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.date) || apt.status === 'cancelled');

  return (
    <div className="space-y-8">
      {/* Upcoming Appointments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-pink-200 bg-pink-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <p className="font-semibold text-gray-900">{appointment.serviceName}</p>
                      <p className="text-sm text-gray-600">Appointment ID: {appointment.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-700">
                    <FiCalendar className="mr-2" />
                    <span>{new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiClock className="mr-2" />
                    <span>{appointment.time}</span>
                  </div>
                </div>

                {appointment.notes && (
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                )}

                <div className="pt-4 border-t border-pink-200 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Price</span>
                  <span className="text-lg font-bold text-pink-600">${appointment.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments</h3>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 opacity-75">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <p className="font-semibold text-gray-900">{appointment.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
          <p className="text-gray-500">Book a service to see your appointments here!</p>
        </div>
      )}
    </div>
  );
}
