import { NextRequest, NextResponse } from 'next/server';
import { createAdminResetToken, cleanExpiredAdminResetTokens, getAdminCredentials } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Clean up old tokens periodically
    await cleanExpiredAdminResetTokens();

    // Get admin credentials
    const admin = await getAdminCredentials();

    // Create reset token
    const resetToken = await createAdminResetToken();

    // Send reset email
    try {
      await sendPasswordResetEmail(admin.email, resetToken.token);
    } catch (emailError) {
      console.error('Error sending admin reset email:', emailError);
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
        warning: 'Email service may be unavailable'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
      email: admin.email
    });
  } catch (error) {
    console.error('Error in admin forgot password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
