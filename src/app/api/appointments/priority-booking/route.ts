import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, saveAppointments, getUsers, saveUsers } from '@/lib/db';
import { Appointment } from '@/lib/content-manager';
import { sendAppointmentConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      userId, 
      serviceId, 
      serviceName, 
      customerName, 
      customerEmail, 
      customerPhone, 
      date, 
      time, 
      benefitType,
      technicianId,
      technicianName
    } = data;

    if (!userId || !serviceId || !date || !time || !benefitType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has membership and available benefits
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex] as any;

    if (!user.membership || user.membership.status !== 'active') {
      return NextResponse.json({ error: 'No active membership' }, { status: 403 });
    }

    // Initialize usage if not exists
    if (!user.membership.usage) {
      user.membership.usage = {
        currentPeriodStart: new Date().toISOString(),
        refillsUsed: 0,
        fullSetsUsed: 0,
      };
    }

    // Check if user has remaining benefits
    // Note: The actual limits should come from the membership tier benefits
    // For now, we'll just track usage and let the frontend handle limit checking
    if (benefitType === 'refill') {
      user.membership.usage.refillsUsed = (user.membership.usage.refillsUsed || 0) + 1;
    } else if (benefitType === 'full_set') {
      user.membership.usage.fullSetsUsed = (user.membership.usage.fullSetsUsed || 0) + 1;
    }

    user.updatedAt = new Date().toISOString();
    users[userIndex] = user;
    await saveUsers(users);

    // Create the appointment
    const appointments = await getAppointments();
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      serviceId,
      serviceName,
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      price: 0, // Free with membership
      originalPrice: 0,
      depositAmount: 0,
      depositPaid: true,
      remainingBalance: 0,
      balancePaid: true,
      userId,
      technicianId: technicianId || undefined,
      technicianName: technicianName || undefined,
      status: 'confirmed', // Auto-confirm priority bookings
      paymentStatus: 'paid', // No payment needed
      notes: `Priority booking - Free ${benefitType === 'refill' ? 'Refill' : 'Full Set'} (${user.membership.tierName} membership)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);
    await saveAppointments(appointments);

    // Send confirmation email
    try {
      await sendAppointmentConfirmationEmail(newAppointment);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      appointment: newAppointment,
      message: 'Priority booking confirmed!'
    });
  } catch (error) {
    console.error('Error creating priority booking:', error);
    return NextResponse.json(
      { error: 'Failed to create priority booking' },
      { status: 500 }
    );
  }
}
