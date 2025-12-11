import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Event from '@/models/Event';

export async function GET() {
  try {
    await connectToDatabase();

    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch events from today onwards
    const events = await Event.find({ date: { $gte: today } })
      .sort({ date: 1 })
      .select('title description date startTime capacity imageUrl location')
      .lean();

    // Add placeholder currentRsvps field
    const eventsWithRsvps = events.map((event) => ({
      ...event,
      currentRsvps: 0, // Placeholder - could be linked to a reservations system
    }));

    return NextResponse.json(eventsWithRsvps, { status: 200 });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
