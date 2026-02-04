import { NextRequest, NextResponse } from 'next/server';
import { getAppointment } from '@/lib/db';
import Stripe from 'stripe';

// Lazy initialize Stripe client
let stripeClient: Stripe | null = null;
function getStripeClient() {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  }
  return stripeClient;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing not configured' }, { status: 503 });
    }

    const { appointmentId } = await request.json();
    
    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }
    
    const appointment = await getAppointment(appointmentId);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Fixed $25 non-refundable deposit
    const DEPOSIT_AMOUNT = 25;
    const depositAmount = Math.min(DEPOSIT_AMOUNT, appointment.price); // Don't charge more than service price
    const remainingBalance = appointment.price - depositAmount;
    
    // Create Stripe checkout session for deposit only
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit - ${appointment.serviceName}`,
              description: `Non-refundable deposit for appointment on ${appointment.date} at ${appointment.time}. Remaining balance of $${remainingBalance.toFixed(2)} due at appointment.`,
            },
            unit_amount: Math.round(depositAmount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/services?booking_cancelled=true`,
      client_reference_id: appointmentId,
      customer_email: appointment.customerEmail,
      metadata: {
        appointmentId: appointmentId,
        depositAmount: depositAmount.toString(),
        remainingBalance: remainingBalance.toString(),
      },
    });
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
