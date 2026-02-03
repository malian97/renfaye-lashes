import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUsers, saveUsers, getStoreSettings } from '@/lib/db';
import { verifyUserToken } from '@/lib/user-auth';
import { sendMembershipCancelledEmail } from '@/lib/email';

const membershipTierPrices: Record<string, number> = {
  natural: 100,
  hybrid: 120,
  volume: 140,
  mega: 165,
};

function getTierPrice(tierId: string): number {
  return membershipTierPrices[tierId] || 0;
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    // Get user from token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyUserToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.id;

    // Get user
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];

    // Check if user has an active membership
    if (!user.membership?.status || user.membership.status !== 'active') {
      return NextResponse.json(
        { error: 'No active membership to cancel' },
        { status: 400 }
      );
    }

    // Cancel at period end (user keeps benefits until end of billing period)
    if (user.membership.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(user.membership.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        // Continue even if Stripe fails - we'll update local status
      }
    }

    // Update user membership status
    user.membership.cancelAtPeriodEnd = true;
    user.updatedAt = new Date().toISOString();

    users[userIndex] = user;
    await saveUsers(users);

    // Send cancellation email
    try {
      const storeSettings = await getStoreSettings();
      const adminEmail = storeSettings.storeEmail;
      const tierPrice = getTierPrice(user.membership.tierId);
      
      await sendMembershipCancelledEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.membership.tierName,
        tierPrice,
        user.membership.currentPeriodEnd || new Date().toISOString(),
        adminEmail
      );
    } catch (emailError) {
      console.error('Error sending membership cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Membership will be cancelled at the end of your billing period',
      cancelDate: user.membership.currentPeriodEnd
    });
  } catch (error) {
    console.error('Error cancelling membership:', error);
    return NextResponse.json(
      { error: 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}
