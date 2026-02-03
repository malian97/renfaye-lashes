import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUsers, saveUsers } from '@/lib/db';
import { verifyUserToken } from '@/lib/user-auth';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  stripePriceId?: string;
}

const membershipTiers: MembershipTier[] = [
  { id: 'natural', name: 'Renfaye Natural', price: 100 },
  { id: 'hybrid', name: 'Renfaye Hybrid', price: 120 },
  { id: 'volume', name: 'Renfaye Volume', price: 140 },
  { id: 'mega', name: 'Renfaye Mega', price: 165 },
];

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 503 }
      );
    }

    // Get user from token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyUserToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    // Get user
    const users = await getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active membership
    if (user.membership?.status === 'active') {
      return NextResponse.json(
        { error: 'You already have an active membership. Please cancel it first to switch plans.' },
        { status: 400 }
      );
    }

    const { tierId } = await request.json();

    // Validate tier
    const tier = membershipTiers.find(t => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.membership?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `Monthly membership - ${tier.name}`,
            },
            unit_amount: tier.price * 100,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership`,
      metadata: {
        userId: user.id,
        tierId: tier.id,
        tierName: tier.name,
        type: 'membership_subscription',
      },
    });

    // Update user with Stripe customer ID if new
    if (!user.membership?.stripeCustomerId) {
      const updatedUsers = users.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              membership: { 
                ...u.membership,
                stripeCustomerId,
                tierId: tier.id,
                tierName: tier.name,
                status: 'cancelled' as const,
              },
              updatedAt: new Date().toISOString() 
            }
          : u
      );
      await saveUsers(updatedUsers);
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating membership checkout:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: message },
      { status: 500 }
    );
  }
}
