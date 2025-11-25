import { NextRequest, NextResponse } from 'next/server';
import { verifyUserPassword } from '@/lib/db';
import { generateUserToken } from '@/lib/user-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await verifyUserPassword(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is suspended
    if (user.suspended) {
      return NextResponse.json(
        { error: `Account suspended. Reason: ${user.suspendedReason || 'No reason provided'}` },
        { status: 403 }
      );
    }

    const token = generateUserToken(user);

    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
