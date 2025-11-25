import { Resend } from 'resend';
import { Order, Appointment } from './content-manager';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const data = await resend.emails.send({
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
              <p>Questions about your order? Contact us at info@renfayelashes.com</p>
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
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://renfayelashes.com'}/contact" style="display: inline-block; background-color: #ec4899; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Contact Us</a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Need to make changes? Contact us at info@renfayelashes.com or call (555) 123-4567</p>
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
              <p>Need help? Contact us at info@renfayelashes.com</p>
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
