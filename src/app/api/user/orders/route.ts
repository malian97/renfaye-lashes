import { NextRequest, NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/user-auth';
import { getOrders } from '@/lib/db';

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

    // Get all orders
    const allOrders = await getOrders();
    
    // Filter orders for this user (by email)
    const userOrders = allOrders.filter(order => 
      order.customerEmail.toLowerCase() === decoded.email.toLowerCase()
    );

    // Sort by date (newest first)
    userOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
