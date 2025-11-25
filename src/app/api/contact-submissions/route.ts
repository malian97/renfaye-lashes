import { NextResponse } from 'next/server';
import { getContactSubmissions, saveContactSubmissions } from '@/lib/db';
import { ContactSubmission } from '@/lib/content-manager';

export async function GET() {
  try {
    const submissions = await getContactSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const submission: ContactSubmission = await request.json();
    const submissions = await getContactSubmissions();
    
    // Check if submission already exists (update) or add new
    const existingIndex = submissions.findIndex(s => s.id === submission.id);
    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }
    
    await saveContactSubmissions(submissions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving contact submission:', error);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const submissions = await getContactSubmissions();
    
    const submission = submissions.find(s => s.id === id);
    if (submission) {
      submission.status = status;
      await saveContactSubmissions(submissions);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const submissions = await getContactSubmissions();
    const filtered = submissions.filter(s => s.id !== id);
    
    await saveContactSubmissions(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
