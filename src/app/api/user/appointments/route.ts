import { NextRequest, NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/user-auth';
import { getAppointments } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyUserToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all appointments
    const allAppointments = await getAppointments();
    
    // Filter appointments for this user (by email)
    const userAppointments = allAppointments.filter(appointment => 
      appointment.customerEmail.toLowerCase() === decoded.email.toLowerCase()
    );

    // Sort by date (newest first)
    userAppointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ appointments: userAppointments });
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
