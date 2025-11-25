import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, saveAppointments } from '@/lib/db';
import { Appointment } from '@/lib/content-manager';
import { sendAppointmentConfirmationEmail } from '@/lib/email';

export async function GET() {
  try {
    const appointments = await getAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const appointments = await getAppointments();
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    await saveAppointments(appointments);
    
    // Send confirmation email to customer
    try {
      await sendAppointmentConfirmationEmail(newAppointment);
    } catch (emailError) {
      console.error('Error sending appointment confirmation email:', emailError);
      // Don't fail the appointment creation if email fails
    }
    
    return NextResponse.json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const appointments = await getAppointments();
    
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await saveAppointments(appointments);
    return NextResponse.json(appointments[index]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
