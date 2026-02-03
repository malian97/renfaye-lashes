import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUsers, saveUsers, getStoreSettings } from '@/lib/db';
import { sendMembershipActivatedEmail } from '@/lib/email';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
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
      expand: ['subscription', 'customer'],
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

    if (!userId || !tierId || !tierName) {
      return NextResponse.json({ error: 'Missing required session metadata' }, { status: 400 });
    }

    // Get subscription details
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription not found on session' }, { status: 400 });
    }

    // Always retrieve subscription fresh to ensure we have all fields
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const subObj: any = subscription;
    const stripeSubscriptionId: string = subObj.id || subscriptionId;
    const cancelAtPeriodEnd: boolean = subObj.cancel_at_period_end ?? false;
    
    // Stripe API may return current_period_end or we calculate from billing_cycle_anchor/start_date
    // For monthly subscriptions, period end = start + 1 month
    let currentPeriodEndUnix: number;
    
    if (subObj.current_period_end) {
      currentPeriodEndUnix = subObj.current_period_end;
    } else if (subObj.billing_cycle_anchor) {
      // Calculate next billing date (1 month from anchor for monthly subs)
      const anchorDate = new Date(subObj.billing_cycle_anchor * 1000);
      anchorDate.setMonth(anchorDate.getMonth() + 1);
      currentPeriodEndUnix = Math.floor(anchorDate.getTime() / 1000);
    } else if (subObj.start_date) {
      // Fallback: use start_date + 1 month
      const startDate = new Date(subObj.start_date * 1000);
      startDate.setMonth(startDate.getMonth() + 1);
      currentPeriodEndUnix = Math.floor(startDate.getTime() / 1000);
    } else {
      // Last resort: set to 30 days from now
      currentPeriodEndUnix = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
    }

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;
    
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
            stripeSubscriptionId,
            stripeCustomerId: customerId,
            currentPeriodEnd: new Date(currentPeriodEndUnix * 1000).toISOString(),
            cancelAtPeriodEnd,
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to verify session', details: message },
      { status: 500 }
    );
  }
}
