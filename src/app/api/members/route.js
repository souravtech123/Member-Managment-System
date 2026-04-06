import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { recalculateRanks } from '@/lib/members';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const team = searchParams.get('team');
    const memberType = searchParams.get('memberType');
    const skills = searchParams.get('skills');
    
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (team) query.team = team;
    if (memberType) query.memberType = memberType;
    if (skills) query.skills = { $in: skills.split(',') };

    const members = await Member.find(query).sort({ rank: 1, contributionScore: -1 });
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const newMember = await Member.create({
      ...data,
      // Default to 0 values if not provided
      contributionScore: data.contributionScore || 0,
    });
    await recalculateRanks();
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
