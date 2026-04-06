import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { recalculateRanks } from '@/lib/members';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();
    const member = await Member.findByIdAndUpdate(id, data, { new: true });
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await recalculateRanks();
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await recalculateRanks();
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
