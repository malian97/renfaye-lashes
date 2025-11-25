import { NextRequest, NextResponse } from 'next/server';
import { createResetToken, cleanExpiredResetTokens } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Clean up old tokens periodically
    await cleanExpiredResetTokens();

    // Create reset token
    const resetToken = await createResetToken(email);

    // Always return success even if email doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (!resetToken) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.'
      });
    }

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken.token);
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      // Still return success to user, but log the error
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
        warning: 'Email service may be unavailable'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
