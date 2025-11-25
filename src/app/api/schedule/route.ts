import { NextRequest, NextResponse } from 'next/server';
import { getScheduleSettings, saveScheduleSettings } from '@/lib/db';

export async function GET() {
  try {
    const schedule = await getScheduleSettings();
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const schedule = await request.json();
    await saveScheduleSettings(schedule);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
  }
}
