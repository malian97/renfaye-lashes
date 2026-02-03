import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getOrders, getAppointments, getProducts, getUsers } from '@/lib/db';

const membershipTierPrices: Record<string, number> = {
  natural: 100,
  hybrid: 120,
  volume: 140,
  mega: 165,
};

function getDateRangeStart(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'lastMonth':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'all':
    default:
      return null;
  }
}

function getDateRangeEnd(period: string): Date | null {
  const now = new Date();
  if (period === 'lastMonth') {
    return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  }
  return null;
}

export async function GET(request: NextRequest) {
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

    // Get time period from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const dateRangeStart = getDateRangeStart(period);
    const dateRangeEnd = getDateRangeEnd(period);

    // Fetch all data server-side
    const [products, allOrders, allAppointments, users] = await Promise.all([
      getProducts(),
      getOrders(),
      getAppointments(),
      getUsers(),
    ]);

    // Filter orders and appointments by date range
    const orders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return (!dateRangeStart || orderDate >= dateRangeStart) &&
             (!dateRangeEnd || orderDate <= dateRangeEnd);
    });
    
    const appointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.createdAt);
      return (!dateRangeStart || aptDate >= dateRangeStart) &&
             (!dateRangeEnd || aptDate <= dateRangeEnd);
    });

    // Calculate product revenue (from paid or completed orders, excluding refunded)
    const productRevenue = orders
      .filter(order => 
        (order.paymentStatus === 'paid' || order.status === 'completed' || order.status === 'processing') &&
        order.paymentStatus !== 'refunded' &&
        order.status !== 'cancelled'
      )
      .reduce((sum, order) => sum + order.total, 0);

    // Calculate service revenue (from paid or confirmed appointments, excluding refunded)
    const serviceRevenue = appointments
      .filter(apt => 
        (apt.paymentStatus === 'paid' || apt.status === 'confirmed' || apt.status === 'completed') &&
        apt.paymentStatus !== 'refunded' &&
        apt.status !== 'cancelled'
      )
      .reduce((sum, apt) => sum + (apt.price || 0), 0);

    // Calculate membership revenue (active members * their tier price)
    const activeMembers = users.filter(u => u.membership?.status === 'active');
    const membershipRevenue = activeMembers.reduce((sum, user) => {
      const tierPrice = membershipTierPrices[user.membership?.tierId || ''] || 0;
      return sum + tierPrice;
    }, 0);

    const totalRevenue = productRevenue + serviceRevenue + membershipRevenue;

    // Unique customers from orders and appointments
    const customerEmails = new Set([
      ...orders.map(o => o.customerEmail),
      ...appointments.map(a => a.customerEmail),
    ]);

    return NextResponse.json({
      products: products.length,
      orders: orders.length,
      bookings: appointments.length,
      totalRevenue,
      productRevenue,
      serviceRevenue,
      membershipRevenue,
      customers: customerEmails.size,
      activeMembers: activeMembers.length,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
