import { NextRequest, NextResponse } from 'next/server';
import { getPages, savePages } from '@/lib/db';

export async function GET() {
  try {
    const pages = await getPages();
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pages = await request.json();
    await savePages(pages);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving pages:', error);
    return NextResponse.json({ error: 'Failed to save pages' }, { status: 500 });
  }
}
