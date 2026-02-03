import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUsers, saveUsers, getStoreSettings } from '@/lib/db';
import { sendMembershipActivatedEmail } from '@/lib/email';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

const membershipTierPrices: Record<string, number> = {
  natural: 100,
  hybrid: 120,
  volume: 140,
  mega: 165,
};

function getTierPrice(tierId: string): number {
  return membershipTierPrices[tierId] || 0;
}

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const metadata = session.metadata;
    if (!metadata || metadata.type !== 'membership_subscription') {
      return NextResponse.json({ error: 'Invalid session type' }, { status: 400 });
    }

    const userId = metadata.userId;
    const tierId = metadata.tierId;
    const tierName = metadata.tierName;

    // Get subscription details
    const subscription = session.subscription as Stripe.Subscription;
    
    // Update user with membership info
    const users = await getUsers();
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          membership: {
            tierId,
            tierName,
            status: 'active' as const,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return user;
    });

    await saveUsers(updatedUsers);

    // Send membership activation email
    const user = updatedUsers.find(u => u.id === userId);
    if (user) {
      try {
        const storeSettings = await getStoreSettings();
        const adminEmail = storeSettings.storeEmail;
        const tierPrice = getTierPrice(tierId);
        
        await sendMembershipActivatedEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          tierName,
          tierPrice,
          adminEmail
        );
      } catch (emailError) {
        console.error('Error sending membership activation email:', emailError);
        // Don't fail the activation if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      tierName,
      message: 'Membership activated successfully' 
    });
  } catch (error) {
    console.error('Error verifying membership session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
