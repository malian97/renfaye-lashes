'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentManager, ScheduleSettings, DaySchedule, TimeSlot } from '@/lib/content-manager';
import { FiClock, FiSave, FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminSchedule() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  
  const dayLabels: Record<typeof daysOfWeek[number], string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const data = await contentManager.getScheduleSettings();
    setSchedule(data);
  };

  const handleSave = async () => {
    if (!schedule) return;
    
    try {
      await contentManager.saveScheduleSettings(schedule);
      setHasChanges(false);
      toast.success('Schedule saved successfully!');
    } catch (error) {
      toast.error('Failed to save schedule');
    }
  };

  const updateDay = (day: typeof daysOfWeek[number], daySchedule: DaySchedule) => {
    if (!schedule) return;
    setSchedule({ ...schedule, [day]: daySchedule });
    setHasChanges(true);
  };

  const addTimeSlot = (day: typeof daysOfWeek[number]) => {
    if (!schedule) return;
    const daySchedule = schedule[day];
    const newSlot: TimeSlot = { start: '09:00', end: '17:00' };
    updateDay(day, {
      ...daySchedule,
      timeSlots: [...daySchedule.timeSlots, newSlot]
    });
  };

  const removeTimeSlot = (day: typeof daysOfWeek[number], index: number) => {
    if (!schedule) return;
    const daySchedule = schedule[day];
    updateDay(day, {
      ...daySchedule,
      timeSlots: daySchedule.timeSlots.filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (day: typeof daysOfWeek[number], index: number, slot: TimeSlot) => {
    if (!schedule) return;
    const daySchedule = schedule[day];
    const newSlots = [...daySchedule.timeSlots];
    newSlots[index] = slot;
    updateDay(day, { ...daySchedule, timeSlots: newSlots });
  };

  if (isLoading || !schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Settings</h1>
            <p className="text-gray-600">Manage your availability and booking settings</p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <FiSave className="mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiCalendar className="mr-2" />
            General Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Slot Duration (minutes)
              </label>
              <input
                type="number"
                value={schedule.slotDuration}
                onChange={(e) => {
                  setSchedule({ ...schedule, slotDuration: parseInt(e.target.value) || 60 });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                min="15"
                step="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Between Slots (minutes)
              </label>
              <input
                type="number"
                value={schedule.breakBetweenSlots}
                onChange={(e) => {
                  setSchedule({ ...schedule, breakBetweenSlots: parseInt(e.target.value) || 0 });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                min="0"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance Booking (days)
              </label>
              <input
                type="number"
                value={schedule.advanceBookingDays}
                onChange={(e) => {
                  setSchedule({ ...schedule, advanceBookingDays: parseInt(e.target.value) || 30 });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">How far in advance clients can book</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Buffer (hours)
              </label>
              <input
                type="number"
                value={schedule.bookingBuffer}
                onChange={(e) => {
                  setSchedule({ ...schedule, bookingBuffer: parseInt(e.target.value) || 0 });
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum hours before appointment can be booked</p>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiClock className="mr-2" />
            Weekly Schedule
          </h2>
          
          <div className="space-y-6">
            {daysOfWeek.map((day) => (
              <div key={day} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={schedule[day].enabled}
                      onChange={(e) => updateDay(day, { ...schedule[day], enabled: e.target.checked })}
                      className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 mr-3"
                    />
                    <label className="text-lg font-medium text-gray-900">
                      {dayLabels[day]}
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Max appointments per slot:</label>
                      <input
                        type="number"
                        value={schedule[day].maxAppointmentsPerSlot}
                        onChange={(e) => updateDay(day, {
                          ...schedule[day],
                          maxAppointmentsPerSlot: parseInt(e.target.value) || 1
                        })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        min="1"
                        disabled={!schedule[day].enabled}
                      />
                    </div>
                    
                    {schedule[day].enabled && (
                      <button
                        onClick={() => addTimeSlot(day)}
                        className="text-pink-600 hover:text-pink-700 flex items-center text-sm"
                      >
                        <FiPlus className="mr-1" />
                        Add Time Slot
                      </button>
                    )}
                  </div>
                </div>

                {schedule[day].enabled && (
                  <div className="ml-7 space-y-3">
                    {schedule[day].timeSlots.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No time slots configured</p>
                    ) : (
                      schedule[day].timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(day, index, { ...slot, start: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(day, index, { ...slot, end: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                            />
                          </div>
                          <button
                            onClick={() => removeTimeSlot(day, index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
