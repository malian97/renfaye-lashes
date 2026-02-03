import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrders, saveOrders, getUsers, saveUsers } from '@/lib/db';
import { getAppointments, saveAppointments } from '@/lib/db';

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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      console.warn('Stripe not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const appointmentId = session.metadata?.appointmentId;

        // Handle product order payment
        if (orderId) {
          const orders = await getOrders();
          const order = orders.find(o => o.id === orderId);

          if (order) {
            order.status = 'processing';
            order.paymentStatus = 'paid';
            order.stripeSessionId = session.id;
            order.stripePaymentIntentId = session.payment_intent as string;
            order.updatedAt = new Date().toISOString();
            
            await saveOrders(orders);
            console.log(`Order ${orderId} marked as paid`);
          }
        }

        // Handle appointment/service payment with points
        if (appointmentId) {
          const appointments = await getAppointments();
          const appointment = appointments.find(a => a.id === appointmentId);

          if (appointment) {
            appointment.status = 'confirmed';
            appointment.paymentStatus = 'paid';
            appointment.paymentIntentId = session.payment_intent as string;
            appointment.updatedAt = new Date().toISOString();

            // Process points for the user
            if (appointment.userId) {
              const users = await getUsers();
              const userIndex = users.findIndex(u => u.id === appointment.userId);

              if (userIndex !== -1) {
                const user = users[userIndex];
                
                // Initialize points if not exists
                if (!user.points) {
                  user.points = { balance: 0, lifetimeEarned: 0, history: [] };
                }

                // Deduct redeemed points
                if (appointment.pointsRedeemed && appointment.pointsRedeemed > 0) {
                  user.points.balance -= appointment.pointsRedeemed;
                  user.points.history.push({
                    id: `pts-${Date.now()}-redeem`,
                    date: new Date().toISOString(),
                    type: 'redeemed',
                    amount: -appointment.pointsRedeemed,
                    description: `Redeemed for ${appointment.serviceName}`,
                    orderId: appointmentId
                  });
                  console.log(`Deducted ${appointment.pointsRedeemed} points from user ${user.id}`);
                }

                // Add earned points
                if (appointment.pointsToEarn && appointment.pointsToEarn > 0) {
                  user.points.balance += appointment.pointsToEarn;
                  user.points.lifetimeEarned += appointment.pointsToEarn;
                  user.points.history.push({
                    id: `pts-${Date.now()}-earn`,
                    date: new Date().toISOString(),
                    type: 'earned',
                    amount: appointment.pointsToEarn,
                    description: `Earned from ${appointment.serviceName}`,
                    orderId: appointmentId
                  });
                  console.log(`Added ${appointment.pointsToEarn} points to user ${user.id}`);
                }

                user.updatedAt = new Date().toISOString();
                users[userIndex] = user;
                await saveUsers(users);
              }
            }

            await saveAppointments(appointments);
            console.log(`Appointment ${appointmentId} confirmed and points processed`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        // Handle failed payment if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
