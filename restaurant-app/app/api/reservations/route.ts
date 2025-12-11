import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Reservation from '@/models/Reservation';

// GET - Fetch all reservations
export async function GET() {
  try {
    await connectToDatabase();

    const reservations = await Reservation.find({})
      .sort({ date: 1 })
      .select('fullName email phone date guests occasion status createdAt')
      .lean();

    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    console.error('Reservations GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

// POST - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { fullName, email, phone, date, time, guests, occasion, notes } =
      body;

    // Validate required fields
    if (!fullName || !email || !phone || !date || !time || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate guests is a valid number
    const guestsNum = parseInt(guests, 10);
    if (isNaN(guestsNum) || guestsNum < 1 || guestsNum > 20) {
      return NextResponse.json(
        { error: 'Number of guests must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Combine date and time into a Date object
    const dateTime = new Date(`${date}T${time}`);

    if (isNaN(dateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      );
    }

    // Create reservation
    const reservation = await Reservation.create({
      fullName,
      email,
      phone,
      date: dateTime,
      guests: guestsNum,
      occasion: occasion || '',
      notes: notes || '',
      status: 'pending',
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    console.error('Reservations POST error:', error);

    // Check if it's a validation error
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation error', details: error },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
