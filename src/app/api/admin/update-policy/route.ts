import { NextRequest, NextResponse } from 'next/server';
import { getSiteContent, saveSiteContent } from '@/lib/db';

// Updated policy content with deposit information
const UPDATED_BOOKING_POLICY = {
  title: 'Booking & Appointment Policy',
  content: [
    {
      subtitle: 'Deposit Requirement',
      text: 'A $25 non-refundable deposit is required at the time of booking to secure your appointment. This deposit will be applied toward your total service cost. The remaining balance is due at the time of your appointment.'
    },
    {
      subtitle: 'Booking Confirmation',
      text: 'All appointments must be confirmed via phone, email, or through our online booking system. You will receive a confirmation message once your booking and deposit payment are complete.'
    },
    {
      subtitle: 'Cancellation Policy',
      text: 'We require at least 24 hours notice for cancellations or rescheduling. Please note that the $25 deposit is non-refundable regardless of when you cancel. Cancellations made with less than 24 hours notice may forfeit the deposit with no exceptions.'
    },
    {
      subtitle: 'Late Arrivals',
      text: 'Please arrive on time for your appointment. If you arrive more than 15 minutes late, we may need to reschedule your appointment or reduce service time to accommodate other clients. Your deposit will not be refunded for late arrivals that result in rescheduling.'
    },
    {
      subtitle: 'No-Show Policy',
      text: 'Failure to show up for a scheduled appointment without prior notice will result in forfeiture of your $25 deposit. Repeat no-shows may require full prepayment for future bookings.'
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    // Get current site content
    const content = await getSiteContent();
    
    if (!content || !content.policy || !content.policy.sections) {
      return NextResponse.json({ error: 'Policy content not found' }, { status: 404 });
    }
    
    // Find and update the Booking & Appointment Policy section
    const bookingPolicyIndex = content.policy.sections.findIndex(
      (section: any) => section.title === 'Booking & Appointment Policy'
    );
    
    if (bookingPolicyIndex === -1) {
      // Add the section if it doesn't exist
      content.policy.sections.push(UPDATED_BOOKING_POLICY);
    } else {
      // Update existing section
      content.policy.sections[bookingPolicyIndex] = UPDATED_BOOKING_POLICY;
    }
    
    // Save updated content
    await saveSiteContent(content);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Booking policy updated with deposit information',
      updatedSection: UPDATED_BOOKING_POLICY
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { error: 'Failed to update policy content' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current policy
export async function GET() {
  try {
    const content = await getSiteContent();
    
    if (!content || !content.policy) {
      return NextResponse.json({ error: 'Policy content not found' }, { status: 404 });
    }
    
    const bookingPolicy = content.policy.sections?.find(
      (section: any) => section.title === 'Booking & Appointment Policy'
    );
    
    return NextResponse.json({
      currentPolicy: bookingPolicy,
      expectedPolicy: UPDATED_BOOKING_POLICY,
      needsUpdate: JSON.stringify(bookingPolicy) !== JSON.stringify(UPDATED_BOOKING_POLICY)
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy content' },
      { status: 500 }
    );
  }
}
