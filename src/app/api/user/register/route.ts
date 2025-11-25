import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { generateUserToken } from '@/lib/user-auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create user
    const user = await createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phone || undefined
    });

    // Generate token
    const token = generateUserToken(user);

    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    if (error instanceof Error && error.message === 'Email already registered') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
