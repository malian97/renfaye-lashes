# Booking & Payment System Setup

This document explains how to set up and use the booking system and e-commerce checkout with Stripe payment integration.

## Required Dependencies

Install the following packages:

```bash
npm install stripe @stripe/stripe-js
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Stripe Configuration
# Get your keys from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Stripe Setup

1. Sign up for a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. For testing, use test mode keys (they start with `sk_test_` and `pk_test_`)
4. For production, switch to live mode keys

## Features Implemented

### Admin Side
- **Schedule Settings** (`/admin/schedule`)
  - Set working hours for each day of the week
  - Configure multiple time slots per day
  - Set max appointments per time slot
  - Configure booking buffer and advance booking limits

### Customer Side
- **Booking Flow** (Services page)
  - Click "Book Now" on any service
  - Fill in customer information (name, email, phone)
  - Select available date and time based on admin schedule
  - Pay full amount via Stripe
  - Automatic appointment creation on successful payment

### API Endpoints Created
- `GET /api/schedule` - Get schedule settings
- `POST /api/schedule` - Save schedule settings
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments` - Update appointment
- `GET /api/appointments/available-slots` - Get available slots for a date
- `POST /api/create-checkout-session` - Create Stripe payment session

### Database Storage
All data is stored in JSON files in the `/data` directory:
- `schedule.json` - Schedule settings
- `appointments.json` - Customer appointments

## Testing the Booking System

1. Set up your schedule in Admin → Schedule
2. Go to the Services page
3. Click "Book Now" on any service
4. Complete the booking form
5. Select date and time
6. Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)

## Webhook Setup (Required for Production)

To receive payment confirmations and update order statuses automatically:

### Local Development
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret (starts with `whsec_`) to your `.env.local`

### Production
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the signing secret to your production environment variables

## E-Commerce Checkout Flow

1. **Add products** to cart from shop page
2. **Click cart icon** and review items
3. **Click "Proceed to Checkout"**
4. **Fill out** shipping and contact information
5. **Click "Place Order"** → Redirects to Stripe Checkout
6. **Complete payment** with card details
7. **Redirected to confirmation** page with order details

## Production Checklist

Before going live:
- [ ] Switch to Stripe live mode keys
- [ ] Update `NEXT_PUBLIC_BASE_URL` to your production domain
- [ ] Set up webhook endpoint for payment confirmations (REQUIRED)
- [ ] Add `STRIPE_WEBHOOK_SECRET` to production environment
- [ ] Configure email notifications for new bookings and orders
- [ ] Test the full booking and checkout flows with real payment methods
- [ ] Set up proper error monitoring
