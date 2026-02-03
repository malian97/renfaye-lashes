import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrders, saveOrders } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

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
    const { sessionId, orderId } = await request.json();

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: 'Missing sessionId or orderId' }, { status: 400 });
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

    // Update order status
    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Only update and send email if not already processed
    if (order.paymentStatus !== 'paid') {
      orders[orderIndex] = {
        ...order,
        paymentStatus: 'paid',
        stripeSessionId: sessionId,
        stripePaymentIntentId: session.payment_intent as string,
        status: 'processing',
        updatedAt: new Date().toISOString()
      };

      await saveOrders(orders);

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(orders[orderIndex]);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: orders[orderIndex]
    });
  } catch (error) {
    console.error('Error verifying order session:', error);
    return NextResponse.json(
      { error: 'Failed to verify order session' },
      { status: 500 }
    );
  }
}
