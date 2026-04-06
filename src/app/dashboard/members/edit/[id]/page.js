import MemberForm from '@/components/MemberForm';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { notFound } from 'next/navigation';

export default async function EditMemberPage({ params }) {
  const { id } = await params;
  
  await connectDB();
  const member = await Member.findById(id).lean();
  
  if (!member) {
    notFound();
  }

  // Serialize to JSON to remove ObjectId for passing to client components
  const serializedMember = JSON.parse(JSON.stringify(member));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 mb-8">
        Edit Member ({serializedMember.name})
      </h1>
      <MemberForm initialData={serializedMember} memberId={id} />
    </div>
  );
}
