import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUsers, getOrders, getAppointments } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const admin = verifyToken(token);
    
    if (!admin) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Get all users
    const allUsers = await getUsers();

    // Remove password hashes from response
    let users = allUsers.map(({ passwordHash, ...user }) => user) as any[];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(search))
      );
    }

    // Get stats for each user
    const orders = await getOrders();
    const appointments = await getAppointments();

    const usersWithStats = users.map(user => {
      const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase());
      const userAppointments = appointments.filter(a => a.customerEmail.toLowerCase() === user.email.toLowerCase());
      
      return {
        ...user,
        stats: {
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, o) => sum + o.total, 0),
          totalAppointments: userAppointments.length
        }
      };
    });

    // Sort by creation date (newest first)
    usersWithStats.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
