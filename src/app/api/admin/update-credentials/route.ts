import { NextRequest, NextResponse } from 'next/server';
import { updateAdminEmail, updateAdminPassword, verifyAdminPassword } from '@/lib/db';
import { verifyToken, generateToken, AdminUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { type, currentPassword, newEmail, newPassword, confirmPassword } = await request.json();

    // Verify current password
    const isPasswordValid = await verifyAdminPassword(user.email, currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    if (type === 'email') {
      // Update email
      if (!newEmail || !newEmail.trim()) {
        return NextResponse.json({ error: 'New email is required' }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      const updatedAdmin = await updateAdminEmail(newEmail);
      
      // Generate new token with updated email
      const newUser: AdminUser = {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name
      };
      const newToken = generateToken(newUser);

      return NextResponse.json({
        success: true,
        message: 'Email updated successfully',
        token: newToken,
        user: newUser
      });
    } 
    
    else if (type === 'password') {
      // Update password
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
      }

      await updateAdminPassword(newPassword);

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Error updating credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
