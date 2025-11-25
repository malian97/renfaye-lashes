import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById, getOrders, getAppointments, getUsers, saveUsers, updateUserPassword } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    // Get user's orders and appointments
    const [orders, appointments] = await Promise.all([
      getOrders(),
      getAppointments()
    ]);

    const userOrders = orders.filter(o => 
      o.customerEmail.toLowerCase() === user.email.toLowerCase()
    );
    
    const userAppointments = appointments.filter(a => 
      a.customerEmail.toLowerCase() === user.email.toLowerCase()
    );

    return NextResponse.json({
      user: userWithoutPassword,
      orders: userOrders,
      appointments: userAppointments,
      stats: {
        totalOrders: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + o.total, 0),
        totalAppointments: userAppointments.length
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];

    // Handle different actions
    if (action === 'suspend') {
      user.suspended = true;
      user.suspendedAt = new Date().toISOString();
      user.suspendedReason = data.reason || 'No reason provided';
      user.updatedAt = new Date().toISOString();
    } else if (action === 'unsuspend') {
      user.suspended = false;
      user.suspendedAt = undefined;
      user.suspendedReason = undefined;
      user.updatedAt = new Date().toISOString();
    } else if (action === 'reset-password') {
      if (!data.newPassword || data.newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      user.passwordHash = bcrypt.hashSync(data.newPassword, 10);
      user.updatedAt = new Date().toISOString();
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    users[userIndex] = user;
    await saveUsers(users);

    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: `User ${action} successfully`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
