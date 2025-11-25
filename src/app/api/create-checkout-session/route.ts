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
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: appointment.serviceName,
              description: `Appointment on ${appointment.date} at ${appointment.time}`,
            },
            unit_amount: Math.round(appointment.price * 100), // Stripe uses cents
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
      },
    });
    
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
