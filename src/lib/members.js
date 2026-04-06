import Member from '@/models/Member';
import connectDB from '@/lib/db';

export async function recalculateRanks() {
  await connectDB();
  // Sort by score descending. For ties, earlier join date gets better rank.
  const members = await Member.find().sort({ contributionScore: -1, joinedAt: 1 });
  
  const bulkOps = members.map((member, index) => ({
    updateOne: {
      filter: { _id: member._id },
      update: { rank: index + 1 }
    }
  }));

  if (bulkOps.length > 0) {
    await Member.bulkWrite(bulkOps);
  }
}
