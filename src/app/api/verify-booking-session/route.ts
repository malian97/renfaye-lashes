import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAppointments, saveAppointments } from '@/lib/db';
import { sendAppointmentConfirmationEmail } from '@/lib/email';

// Lazy initialize Stripe client
let stripeClient: Stripe | null = null;
function getStripeClient() {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, appointmentId } = await request.json();

    if (!sessionId || !appointmentId) {
      return NextResponse.json({ error: 'Missing sessionId or appointmentId' }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing not configured' }, { status: 503 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Update appointment status
    const appointments = await getAppointments();
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);

    if (appointmentIndex === -1) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const appointment = appointments[appointmentIndex];

    // Get deposit info from session metadata
    const depositAmount = session.metadata?.depositAmount ? parseFloat(session.metadata.depositAmount) : 25;
    const remainingBalance = session.metadata?.remainingBalance ? parseFloat(session.metadata.remainingBalance) : (appointment.price - depositAmount);

    // Only update and send email if not already processed
    if (appointment.paymentStatus === 'pending') {
      appointments[appointmentIndex] = {
        ...appointment,
        depositAmount: depositAmount,
        depositPaid: true,
        remainingBalance: remainingBalance,
        balancePaid: remainingBalance === 0, // If service costs $25 or less, fully paid
        paymentStatus: remainingBalance === 0 ? 'paid' : 'deposit_paid',
        status: 'confirmed',
        paymentIntentId: session.payment_intent as string,
        updatedAt: new Date().toISOString()
      };

      await saveAppointments(appointments);

      // Send confirmation email
      try {
        await sendAppointmentConfirmationEmail(appointments[appointmentIndex]);
      } catch (emailError) {
        console.error('Failed to send appointment confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      appointment: appointments[appointmentIndex]
    });
  } catch (error) {
    console.error('Error verifying booking session:', error);
    return NextResponse.json(
      { error: 'Failed to verify booking session' },
      { status: 500 }
    );
  }
}
