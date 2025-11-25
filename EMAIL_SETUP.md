# Email Notifications Setup

This application uses [Resend](https://resend.com) to send email confirmations for orders and appointments.

## Setup Instructions

### 1. Get Resend API Key

1. Sign up for a free account at [resend.com](https://resend.com)
2. Navigate to API Keys in your dashboard
3. Create a new API key
4. Copy the key (starts with `re_`)

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Important Notes:**
- For testing, you can use `onboarding@resend.dev` as the FROM_EMAIL
- For production, you need to:
  1. Verify your domain in Resend
  2. Update FROM_EMAIL to use your verified domain (e.g., `noreply@yourdomain.com`)

### 3. Domain Verification (Production)

For production use:

1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add the DNS records to your domain provider
4. Wait for verification (usually a few minutes)
5. Update `FROM_EMAIL` in `.env.local` to use your verified domain

### 4. Testing

To test email functionality:

1. Create a test order or appointment
2. Check the server logs for any email errors
3. Check the customer's email inbox

**Note:** Emails will NOT be sent if `RESEND_API_KEY` is not configured. The system will log a warning but continue to function.

## Email Templates

The system sends two types of emails:

### Order Confirmation
- **Trigger:** When a new order is created via `/api/orders`
- **Recipient:** Customer email from order
- **Content:**
  - Order ID and date
  - Itemized list of products
  - Pricing breakdown (subtotal, shipping, tax, total)
  - Shipping address
  - Contact information

### Appointment Confirmation
- **Trigger:** When a new appointment is booked via `/api/appointments`
- **Recipient:** Customer email from appointment
- **Content:**
  - Service name
  - Date and time
  - Price
  - Customer information
  - Important reminders
  - Contact information

## Email Design

Both email templates feature:
- Responsive HTML design
- RENFAYE LASHES branding
- Professional styling with pink/gradient theme
- Clear call-to-action buttons
- Mobile-friendly layout

## Troubleshooting

### Emails Not Sending

1. **Check API Key:** Ensure `RESEND_API_KEY` is set correctly
2. **Check Logs:** Look for errors in server console
3. **Verify Domain:** For production, ensure domain is verified
4. **Test API Key:** Try sending a test email via Resend dashboard

### Development vs Production

- **Development:** Use `onboarding@resend.dev` - works immediately, limited to 1 email per day
- **Production:** Use verified domain - unlimited emails, professional sender address

### Rate Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month
- Need more? Upgrade to paid plan

## Security

- **Never commit** `.env.local` to version control
- Keep API keys secure
- Use different API keys for development and production
- Rotate keys if compromised

## Support

For issues with Resend:
- Documentation: [resend.com/docs](https://resend.com/docs)
- Support: [resend.com/support](https://resend.com/support)
