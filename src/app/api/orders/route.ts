import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrders } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    const orders = await getOrders();
    
    // Generate new order ID if not present
    const newOrder = {
      ...orderData,
      id: orderData.id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await saveOrders(orders);
    
    // Send confirmation email to customer
    try {
      await sendOrderConfirmationEmail(newOrder);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }
    
    return NextResponse.json(newOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 });
    }
    
    const orders = await getOrders();
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    await saveOrders(orders);
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
