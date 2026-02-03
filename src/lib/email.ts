import { Resend } from 'resend';
import { Order, Appointment } from './content-manager';

// Lazy initialize Resend only when needed
let resend: Resend | null = null;
function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const STORE_NAME = 'RENFAYE LASHES';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const client = getResendClient();
    
    if (!client) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const data = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Order confirmation email template
export function generateOrderConfirmationEmail(order: Order): string {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong><br>
        <span style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${STORE_NAME}</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Confirmation</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Thank you for your order! We're excited to get your products to you.
            </p>

            <!-- Order Details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Order Details</h3>
              <p style="margin: 8px 0;"><strong>Order ID:</strong> ${order.id}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #10b981;">${order.status}</span></p>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong>Subtotal:</strong></td>
                  <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong>$${(order.total - (order.shippingCost || 0) - (order.taxAmount || 0)).toFixed(2)}</strong></td>
                </tr>
                ${order.shippingCost ? `
                <tr>
                  <td style="padding: 12px; text-align: right;">Shipping:</td>
                  <td style="padding: 12px; text-align: right;">$${order.shippingCost.toFixed(2)}</td>
                </tr>
                ` : ''}
                ${order.taxAmount ? `
                <tr>
                  <td style="padding: 12px; text-align: right;">Tax:</td>
                  <td style="padding: 12px; text-align: right;">$${order.taxAmount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong>Total:</strong></td>
                  <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb; color: #ec4899; font-size: 18px;"><strong>$${order.total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>

            <!-- Shipping Address -->
            ${order.shippingAddress ? `
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Shipping Address</h3>
              <p style="margin: 4px 0;">${order.customerName}</p>
              <p style="margin: 4px 0; color: #6b7280;">${order.customerEmail}</p>
              <p style="margin: 4px 0; color: #6b7280;">${order.shippingAddress.address}</p>
              <p style="margin: 4px 0; color: #6b7280;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
            </div>
            ` : ''}

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Questions about your order? Contact us at renfayelashessupplies@gmail.com</p>
              <p style="margin-top: 16px;">Thank you for shopping with ${STORE_NAME}!</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Appointment confirmation email template
export function generateAppointmentConfirmationEmail(appointment: Appointment): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${STORE_NAME}</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Appointment Confirmed!</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Your appointment has been successfully scheduled. We can't wait to see you!
            </p>

            <!-- Appointment Details -->
            <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #ec4899;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 20px;">Appointment Details</h3>
              <div style="margin: 16px 0;">
                <p style="margin: 8px 0;"><strong style="color: #1f2937;">Service:</strong> <span style="color: #4b5563;">${appointment.serviceName}</span></p>
                <p style="margin: 8px 0;"><strong style="color: #1f2937;">Date:</strong> <span style="color: #4b5563;">${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p style="margin: 8px 0;"><strong style="color: #1f2937;">Time:</strong> <span style="color: #4b5563;">${appointment.time}</span></p>
                ${appointment.price ? `<p style="margin: 8px 0;"><strong style="color: #1f2937;">Price:</strong> <span style="color: #ec4899; font-size: 18px;">$${appointment.price}</span></p>` : ''}
              </div>
            </div>

            <!-- Customer Information -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Your Information</h3>
              <p style="margin: 4px 0;"><strong>Name:</strong> ${appointment.customerName}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${appointment.customerEmail}</p>
              <p style="margin: 4px 0;"><strong>Phone:</strong> ${appointment.customerPhone}</p>
              ${appointment.notes ? `<p style="margin: 8px 0 0 0;"><strong>Notes:</strong><br><span style="color: #6b7280;">${appointment.notes}</span></p>` : ''}
            </div>

            <!-- Important Information -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h4 style="margin-top: 0; color: #92400e; font-size: 16px;">📌 Important Information</h4>
              <ul style="margin: 8px 0; padding-left: 20px; color: #78350f;">
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                <li>Bring a valid ID for verification</li>
              </ul>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://renfaye.com'}/contact" style="display: inline-block; background-color: #ec4899; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Contact Us</a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Need to make changes? Contact us at renfayelashessupplies@gmail.com or call +1 (912) 259-4886</p>
              <p style="margin-top: 16px;">We look forward to seeing you at ${STORE_NAME}!</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(order: Order) {
  const html = generateOrderConfirmationEmail(order);
  
  return sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation - ${order.id}`,
    html,
  });
}

// Send appointment confirmation email
export async function sendAppointmentConfirmationEmail(appointment: Appointment) {
  const html = generateAppointmentConfirmationEmail(appointment);
  
  return sendEmail({
    to: appointment.customerEmail,
    subject: `Appointment Confirmed - ${new Date(appointment.date).toLocaleDateString()}`,
    html,
  });
}

// Password reset email template
export function generatePasswordResetEmail(email: string, resetToken: string): string {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${STORE_NAME}</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 16px;">
              We received a request to reset the password for your account associated with <strong>${email}</strong>.
            </p>

            <p style="color: #4b5563; font-size: 16px;">
              Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.
            </p>

            <!-- Reset Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #ec4899; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #6b7280; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 4px;">
              ${resetUrl}
            </p>

            <!-- Security Notice -->}
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h4 style="margin-top: 0; color: #92400e; font-size: 16px;">🔒 Security Notice</h4>
              <ul style="margin: 8px 0; padding-left: 20px; color: #78350f; font-size: 14px;">
                <li>If you didn't request this reset, you can safely ignore this email</li>
                <li>Your password won't change until you create a new one</li>
                <li>Never share this link with anyone</li>
                <li>This link expires in 1 hour for your security</li>
              </ul>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Need help? Contact us at renfayelashessupplies@gmail.com or call +1 (912) 259-4886</p>
              <p style="margin-top: 16px;">This is an automated message from ${STORE_NAME}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const html = generatePasswordResetEmail(email, resetToken);
  
  return sendEmail({
    to: email,
    subject: 'Reset Your Password - RENFAYE LASHES',
    html,
  });
}

// Membership activation email template (to customer)
export function generateMembershipActivatedEmail(
  customerName: string,
  tierName: string,
  price: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${STORE_NAME} Membership!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${STORE_NAME}</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">🎉 Welcome to ${tierName}!</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Hi ${customerName},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              Thank you for becoming a member! Your <strong>${tierName}</strong> membership is now active.
            </p>

            <!-- Membership Details -->
            <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #ec4899;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 20px;">Membership Details</h3>
              <p style="margin: 8px 0;"><strong>Plan:</strong> ${tierName}</p>
              <p style="margin: 8px 0;"><strong>Monthly Price:</strong> $${price.toFixed(2)}/month</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Active</span></p>
            </div>

            <!-- Benefits -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h4 style="margin-top: 0; color: #166534; font-size: 16px;">✨ Your Member Benefits</h4>
              <ul style="margin: 8px 0; padding-left: 20px; color: #166534;">
                <li>Exclusive member discounts on products</li>
                <li>Priority booking for services</li>
                <li>Earn points on every service booking</li>
                <li>Special member-only promotions</li>
              </ul>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://renfaye.com'}/account" style="display: inline-block; background-color: #ec4899; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View My Account</a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Questions? Contact us at renfayelashessupplies@gmail.com</p>
              <p style="margin-top: 16px;">Thank you for being a valued member of ${STORE_NAME}!</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Membership cancellation email template (to customer)
export function generateMembershipCancelledEmail(
  customerName: string,
  tierName: string,
  cancelDate: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Membership Cancellation Scheduled</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${STORE_NAME}</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Membership Cancellation Scheduled</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Hi ${customerName},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              We're sorry to see you go. Your <strong>${tierName}</strong> membership has been scheduled for cancellation.
            </p>

            <!-- Cancellation Details -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #92400e; font-size: 18px;">📅 Important Information</h3>
              <p style="margin: 8px 0; color: #78350f;">
                <strong>Your membership will remain active until:</strong><br>
                <span style="font-size: 18px; font-weight: bold;">${new Date(cancelDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
              <p style="margin: 8px 0; color: #78350f; font-size: 14px;">
                You can continue to enjoy all member benefits until this date.
              </p>
            </div>

            <!-- Re-subscribe CTA -->
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: #166534; margin: 0 0 16px 0;">Changed your mind? You can re-subscribe anytime!</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://renfaye.com'}/membership" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Membership Plans</a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Questions? Contact us at renfayelashessupplies@gmail.com</p>
              <p style="margin-top: 16px;">We hope to see you again at ${STORE_NAME}!</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Admin notification email for new membership
export function generateAdminMembershipNotificationEmail(
  customerName: string,
  customerEmail: string,
  tierName: string,
  price: number,
  action: 'subscribed' | 'cancelled'
): string {
  const actionText = action === 'subscribed' ? 'New Membership Subscription' : 'Membership Cancellation';
  const actionColor = action === 'subscribed' ? '#10b981' : '#ef4444';
  const actionEmoji = action === 'subscribed' ? '🎉' : '📤';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${actionText}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${STORE_NAME} Admin</h1>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            <div style="background-color: ${action === 'subscribed' ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${actionColor}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h2 style="color: ${actionColor}; margin: 0; font-size: 18px;">${actionEmoji} ${actionText}</h2>
            </div>

            <!-- Customer Details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 16px;">Customer Details</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin: 8px 0;"><strong>Membership:</strong> ${tierName}</p>
              <p style="margin: 8px 0;"><strong>Monthly Price:</strong> $${price.toFixed(2)}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://renfaye.com'}/admin/users" style="display: inline-block; background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Users in Admin</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Send membership activated email
export async function sendMembershipActivatedEmail(
  customerEmail: string,
  customerName: string,
  tierName: string,
  price: number,
  adminEmail?: string
) {
  const customerHtml = generateMembershipActivatedEmail(customerName, tierName, price);
  
  // Send to customer
  const customerResult = await sendEmail({
    to: customerEmail,
    subject: `Welcome to ${tierName} - Your Membership is Active!`,
    html: customerHtml,
  });

  // Send notification to admin if email provided
  if (adminEmail) {
    const adminHtml = generateAdminMembershipNotificationEmail(customerName, customerEmail, tierName, price, 'subscribed');
    await sendEmail({
      to: adminEmail,
      subject: `New Membership: ${customerName} subscribed to ${tierName}`,
      html: adminHtml,
    });
  }

  return customerResult;
}

// Send membership cancelled email
export async function sendMembershipCancelledEmail(
  customerEmail: string,
  customerName: string,
  tierName: string,
  price: number,
  cancelDate: string,
  adminEmail?: string
) {
  const customerHtml = generateMembershipCancelledEmail(customerName, tierName, cancelDate);
  
  // Send to customer
  const customerResult = await sendEmail({
    to: customerEmail,
    subject: `Membership Cancellation Scheduled - ${STORE_NAME}`,
    html: customerHtml,
  });

  // Send notification to admin if email provided
  if (adminEmail) {
    const adminHtml = generateAdminMembershipNotificationEmail(customerName, customerEmail, tierName, price, 'cancelled');
    await sendEmail({
      to: adminEmail,
      subject: `Membership Cancelled: ${customerName} cancelled ${tierName}`,
      html: adminHtml,
    });
  }

  return customerResult;
}

// Refund email template
export function generateRefundEmail(
  customerName: string,
  itemDescription: string,
  amount: number,
  reason: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refund Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${STORE_NAME}</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">💰 Refund Processed</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Hi ${customerName},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              We have processed a refund for your recent purchase. The details are below:
            </p>

            <!-- Refund Details -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 24px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #166534; font-size: 18px;">Refund Details</h3>
              <p style="margin: 8px 0;"><strong>Item:</strong> ${itemDescription}</p>
              <p style="margin: 8px 0;"><strong>Refund Amount:</strong> <span style="color: #10b981; font-size: 20px; font-weight: bold;">$${amount.toFixed(2)}</span></p>
              <p style="margin: 8px 0;"><strong>Reason:</strong> ${reason}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <!-- Processing Time -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>📅 Processing Time:</strong> Please allow 5-10 business days for the refund to appear in your account, depending on your bank or payment provider.
              </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Questions about your refund? Contact us at renfayelashessupplies@gmail.com</p>
              <p style="margin-top: 16px;">Thank you for your understanding.</p>
              <p style="margin-top: 8px;">${STORE_NAME}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Admin notification for refund
export function generateAdminRefundNotificationEmail(
  customerName: string,
  customerEmail: string,
  itemDescription: string,
  amount: number,
  reason: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refund Processed</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${STORE_NAME} Admin</h1>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h2 style="color: #dc2626; margin: 0; font-size: 18px;">💸 Refund Processed</h2>
            </div>

            <!-- Refund Details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 16px 0;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 16px;">Refund Details</h3>
              <p style="margin: 8px 0;"><strong>Customer:</strong> ${customerName}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin: 8px 0;"><strong>Item:</strong> ${itemDescription}</p>
              <p style="margin: 8px 0;"><strong>Amount:</strong> <span style="color: #dc2626; font-weight: bold;">$${amount.toFixed(2)}</span></p>
              <p style="margin: 8px 0;"><strong>Reason:</strong> ${reason}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://renfaye.com'}/admin/orders" style="display: inline-block; background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Orders</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Send refund email
export async function sendRefundEmail(
  customerEmail: string,
  customerName: string,
  itemDescription: string,
  amount: number,
  reason: string,
  adminEmail?: string
) {
  const customerHtml = generateRefundEmail(customerName, itemDescription, amount, reason);
  
  // Send to customer
  const customerResult = await sendEmail({
    to: customerEmail,
    subject: `Refund Confirmation - ${STORE_NAME}`,
    html: customerHtml,
  });

  // Send notification to admin if email provided
  if (adminEmail) {
    const adminHtml = generateAdminRefundNotificationEmail(customerName, customerEmail, itemDescription, amount, reason);
    await sendEmail({
      to: adminEmail,
      subject: `Refund Processed: $${amount.toFixed(2)} for ${customerName}`,
      html: adminHtml,
    });
  }

  return customerResult;
}
