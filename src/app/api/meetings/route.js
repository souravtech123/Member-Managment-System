import connectDB from '@/lib/db';
import Meeting from '@/models/Meeting';
import Member from '@/models/Member';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectDB();
    const { title, date } = await req.json();

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const newMeeting = await Meeting.create({ title, date });
    return NextResponse.json({ success: true, meeting: newMeeting });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const meetings = await Meeting.find({}).sort({ date: -1 });
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
