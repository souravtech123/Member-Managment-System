import connectDB from '@/lib/db';
import Meeting from '@/models/Meeting';
import Member from '@/models/Member';
import Attendance from '@/models/Attendance';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const totalMeetings = await Meeting.countDocuments();
    const members = await Member.find({}).lean();

    const attendanceRecords = await Attendance.find({ status: 'Present' }).lean();

    const report = members.map((member) => {
      const attendedMeetings = attendanceRecords.filter(
        (record) => record.memberId.toString() === member._id.toString()
      ).length;

      const percentage = totalMeetings === 0 ? 0 : (attendedMeetings / totalMeetings) * 100;

      return {
        id: member._id.toString(),
        name: member.name,
        team: member.team,
        attended: attendedMeetings,
        total: totalMeetings,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    report.sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({ success: true, totalMeetings, report });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
