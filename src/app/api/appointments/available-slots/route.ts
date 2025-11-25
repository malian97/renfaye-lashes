import { NextRequest, NextResponse } from 'next/server';
import { getScheduleSettings, getAppointments } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date'); // YYYY-MM-DD
    const serviceId = searchParams.get('serviceId');
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    
    // Get schedule settings
    const schedule = await getScheduleSettings();
    
    // Get day of week
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayOfWeek = dayName as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    const daySchedule = schedule[dayOfWeek];
    
    // Check if day is enabled
    if (!daySchedule || !daySchedule.enabled) {
      return NextResponse.json([]);
    }
    
    // Generate all possible slots for the day
    const availableSlots: string[] = [];
    
    for (const timeSlot of daySchedule.timeSlots) {
      const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
      const [endHour, endMinute] = timeSlot.end.split(':').map(Number);
      
      let currentTime = startHour * 60 + startMinute; // in minutes
      const endTime = endHour * 60 + endMinute;
      
      while (currentTime + schedule.slotDuration <= endTime) {
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        availableSlots.push(timeString);
        currentTime += schedule.slotDuration + schedule.breakBetweenSlots;
      }
    }
    
    // Get existing appointments for this date
    const appointments = await getAppointments();
    const dateAppointments = appointments.filter(a => 
      a.date === date && 
      a.status !== 'cancelled' &&
      a.paymentStatus === 'paid'
    );
    
    // Count appointments per slot
    const slotCounts = new Map<string, number>();
    dateAppointments.forEach(apt => {
      slotCounts.set(apt.time, (slotCounts.get(apt.time) || 0) + 1);
    });
    
    // Filter out fully booked slots
    const availableFilteredSlots = availableSlots.filter(slot => {
      const count = slotCounts.get(slot) || 0;
      return count < daySchedule.maxAppointmentsPerSlot;
    });
    
    // Check booking buffer (minimum hours before appointment)
    const now = new Date();
    const bufferTime = new Date(now.getTime() + schedule.bookingBuffer * 60 * 60 * 1000);
    
    const filteredByBuffer = availableFilteredSlots.filter(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotDateTime = new Date(date);
      slotDateTime.setHours(hours, minutes, 0, 0);
      return slotDateTime > bufferTime;
    });
    
    return NextResponse.json(filteredByBuffer);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
