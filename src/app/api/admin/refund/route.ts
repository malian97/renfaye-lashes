import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyToken } from '@/lib/auth';
import { getOrders, saveOrders, getAppointments, saveAppointments, getStoreSettings } from '@/lib/db';
import { sendRefundEmail } from '@/lib/email';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, id, reason } = await request.json();

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    if (type !== 'order' && type !== 'booking') {
      return NextResponse.json({ error: 'Invalid type. Must be "order" or "booking"' }, { status: 400 });
    }

    let paymentIntentId: string | undefined;
    let customerEmail: string;
    let customerName: string;
    let amount: number;
    let itemDescription: string;

    if (type === 'order') {
      const orders = await getOrders();
      const orderIndex = orders.findIndex(o => o.id === id);
      
      if (orderIndex === -1) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const order = orders[orderIndex];

      if (order.paymentStatus === 'refunded') {
        return NextResponse.json({ error: 'Order has already been refunded' }, { status: 400 });
      }

      // Allow refund for paid orders OR completed orders (completed implies paid)
      if (order.paymentStatus !== 'paid' && order.status !== 'completed') {
        return NextResponse.json({ error: 'Order has not been paid' }, { status: 400 });
      }

      paymentIntentId = order.stripePaymentIntentId;
      customerEmail = order.customerEmail;
      customerName = order.customerName;
      amount = order.total;
      itemDescription = `Order #${order.id}`;

      // Update order status
      orders[orderIndex] = {
        ...order,
        paymentStatus: 'refunded',
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      };
      await saveOrders(orders);

    } else {
      // type === 'booking'
      const appointments = await getAppointments();
      const appointmentIndex = appointments.findIndex(a => a.id === id);
      
      if (appointmentIndex === -1) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      const appointment = appointments[appointmentIndex];

      if (appointment.paymentStatus === 'refunded') {
        return NextResponse.json({ error: 'Booking has already been refunded' }, { status: 400 });
      }

      // Allow refund for paid, confirmed, or completed bookings
      if (appointment.paymentStatus !== 'paid' && appointment.status !== 'confirmed' && appointment.status !== 'completed') {
        return NextResponse.json({ error: 'Booking has not been paid or confirmed' }, { status: 400 });
      }

      paymentIntentId = appointment.paymentIntentId;
      customerEmail = appointment.customerEmail;
      customerName = appointment.customerName;
      amount = appointment.price;
      itemDescription = `${appointment.serviceName} booking on ${appointment.date}`;

      // Update appointment status
      appointments[appointmentIndex] = {
        ...appointment,
        paymentStatus: 'refunded',
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      };
      await saveAppointments(appointments);
    }

    // Process Stripe refund if payment intent exists
    let stripeRefund = null;
    if (stripe && paymentIntentId) {
      try {
        stripeRefund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer',
        });
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // If Stripe refund fails, we still mark as refunded in our system
        // but log the error for manual handling
        console.error(`Manual refund may be needed for ${type} ${id}: ${stripeError.message}`);
      }
    }

    // Send refund email to customer
    try {
      const storeSettings = await getStoreSettings();
      await sendRefundEmail(
        customerEmail,
        customerName,
        itemDescription,
        amount,
        reason || 'Refund processed by admin',
        storeSettings.storeEmail
      );
    } catch (emailError) {
      console.error('Error sending refund email:', emailError);
      // Don't fail the refund if email fails
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'order' ? 'Order' : 'Booking'} refunded successfully`,
      stripeRefundId: stripeRefund?.id,
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
