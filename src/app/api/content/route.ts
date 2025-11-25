import { NextResponse } from 'next/server';
import { getSiteContent, saveSiteContent } from '@/lib/db';

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const content = await request.json();
    await saveSiteContent(content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving site content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
