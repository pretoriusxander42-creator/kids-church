import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MenuCategory from '@/models/MenuCategory';
import MenuItem from '@/models/MenuItem';

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all categories sorted by order
    const categories = await MenuCategory.find({}).sort({ order: 1 }).lean();

    // Fetch all menu items and populate category
    const items = await MenuItem.find({ available: true })
      .populate('category')
      .lean();

    // Group items by category
    const menuData = categories.map((category) => ({
      category,
      items: items.filter(
        (item) => item.category._id.toString() === category._id.toString()
      ),
    }));

    return NextResponse.json(menuData, { status: 200 });
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}
