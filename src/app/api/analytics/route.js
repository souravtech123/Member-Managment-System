import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectDB();
    
    const totalMembers = await Member.countDocuments();
    
    // Aggregate members by team, get count and avg score
    const teamDistribution = await Member.aggregate([
      { $group: { _id: "$team", count: { $sum: 1 }, avgScore: { $avg: "$contributionScore" } } }
    ]);

    // Aggregate by skills
    const skillsDistribution = await Member.aggregate([
      { $match: { skills: { $exists: true, $ne: [] } } },
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } }
    ]);
    
    const topMembers = await Member.find().sort({ contributionScore: -1 }).limit(5);
    const lowPerformers = await Member.find().sort({ contributionScore: 1 }).limit(5);

    // Member of the month => High score updated in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const memberOfTheMonth = await Member.findOne({ updatedAt: { $gte: thirtyDaysAgo } }).sort({ contributionScore: -1 });

    const mostValuable = await Member.findOne().sort({ contributionScore: -1 });
    const leastActive = await Member.findOne().sort({ contributionScore: 1 });

    const bestTeamDoc = [...teamDistribution].sort((a,b) => b.avgScore - a.avgScore)[0];
    const bestTeam = bestTeamDoc ? { name: bestTeamDoc._id, avgScore: bestTeamDoc.avgScore } : null;

    return NextResponse.json({
      totalMembers,
      teamDistribution,
      skillsDistribution,
      topMembers,
      lowPerformers,
      memberOfTheMonth,
      mostValuable,
      leastActive,
      bestTeam
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
