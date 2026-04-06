import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectDB();
    const { meetingId, attendanceData } = await req.json();

    if (!meetingId || !attendanceData || !Array.isArray(attendanceData)) {
      return NextResponse.json({ error: 'Invalid attendance data format' }, { status: 400 });
    }

    // Upsert attendance for each member
    const operations = attendanceData.map((record) => ({
      updateOne: {
        filter: { meetingId, memberId: record.memberId },
        update: { $set: { status: record.status } },
        upsert: true,
      }
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    return NextResponse.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const attendance = await Attendance.find({ meetingId }).populate('memberId', 'name team');
    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
