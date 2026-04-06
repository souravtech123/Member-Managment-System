import connectDB from '@/lib/db';
import Meeting from '@/models/Meeting';
import Attendance from '@/models/Attendance';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const meeting = await Meeting.findByIdAndDelete(id);
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Also delete all attendance records for this meeting
    await Attendance.deleteMany({ meetingId: id });

    return NextResponse.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
