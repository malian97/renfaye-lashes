import { NextRequest, NextResponse } from 'next/server';
import { validateAdminResetToken, markAdminResetTokenAsUsed, updateAdminPassword } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate token
    const validation = await validateAdminResetToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid token' },
        { status: 400 }
      );
    }

    // Update password
    await updateAdminPassword(newPassword);

    // Mark token as used
    await markAdminResetTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validate token without resetting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const validation = await validateAdminResetToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Error validating admin token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
